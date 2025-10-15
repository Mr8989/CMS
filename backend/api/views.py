from django.shortcuts import render,redirect, get_object_or_404
from django.contrib import messages
from django.db import transaction
from django.db.models import Count, Q
import pandas as pd
from io import BytesIO
from .models import Members, Attendance, AttendanceRecord
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_history(request):
    """View all past attendance records"""
    records = AttendanceRecord.objects.all().annotate(
        present_count=Count('attendances', filter=Q(attendances__present=True)),
        absent_count=Count('attendances', filter=Q(attendances__present=False))
    ).order_by('-date')
    
    context = {
        'records': records,
        'total_records': records.count()
    }
    
    return render(request, 'attendance/history.html', context)

def delete_attendance_record(request, pk):
    """Delete an attendance record"""
    if request.method == 'POST':
        record = get_object_or_404(AttendanceRecord, pk=pk)
        date = record.date
        record.delete()
        messages.success(request, f'Attendance record for {date} has been deleted.')
    return redirect('attendance_history')



def upload_attendance(request):
    if request.method == 'POST' and request.FILES.get('excel_file'):
        excel_file = request.FILES['excel_file']
        service_date = request.POST.get('service_date')
        service_type = request.POST.get('service_type', 'Sunday Service')

        try:
            #Read excel file
            df = pd.read_excel(excel_file)

            #clean column names (strip white space and convert to lowercase)
            df.columns = df.columns.str.strip().str.lower()

            #Get or create attendance record 
            with transaction.atomic():
                attendance_record, created = AttendanceRecord.objects.get_or_create(
                    date = service_date,
                    service_type = service_type
                )

                #Clear existing attendance for this record 
                Attendance.objects.filter(record=attendance_record).delete()

                #Track statistics 
                present_members = []
                not_found_members = []

                #Process Excel rows - matching  first_name, laast_nam, middle_name
                for idx, row in df.iterrows():
                    first_name = str(row.get('first_name', '')).strip()
                    last_name = str(row.get('last_name', '')).strip()
                    middle_name = str(row.get('middle_name', '')).strip()

                    #skip id essential names are missing 
                    if not first_name or not last_name or first_name.lower() == 'nan' or last_name.lower() == 'nan':
                        continue
                    
                    # Handle middle name (could be empty)
                    if middle_name.lower() == 'nan' or not middle_name:
                        middle_name = None
                    
                    try:
                        # Try to find member by first_name, last_name, and middle_name
                        if middle_name:
                            member = Members.objects.get(
                                first_name__iexact=first_name,
                                last_name__iexact=last_name,
                                middle_name__iexact=middle_name
                            )
                        else:
                            # If no middle name, find by first and last name only
                            member = Members.objects.get(
                                first_name__iexact=first_name,
                                last_name__iexact=last_name,
                                middle_name__isnull=True
                            )
                        
                        Attendance.objects.create(
                            member=member,
                            record=attendance_record,
                            present=True
                        )
                        present_members.append(member.id)
                    except Members.DoesNotExist:
                        full_name = f"{first_name} {middle_name} {last_name}" if middle_name else f"{first_name} {last_name}"
                        not_found_members.append(full_name)
                    except Members.MultipleObjectsReturned:
                        # If multiple members found, log it
                        full_name = f"{first_name} {middle_name} {last_name}" if middle_name else f"{first_name} {last_name}"
                        not_found_members.append(f"{full_name} (duplicate)")
                
                # Get absent members
                all_members = Members.objects.all()
                absent_members = all_members.exclude(id__in=present_members)
                
                # Create absent records
                for member in absent_members:
                    Attendance.objects.create(
                        member=member,
                        record=attendance_record,
                        present=False
                    )
                
                # Success message
                messages.success(
                    request,
                    f"Attendance uploaded successfully! Present: {len(present_members)}, "
                    f"Absent: {absent_members.count()}"
                )
                
                if not_found_members:
                    messages.warning(
                        request,
                        f"Members not found in database: {', '.join(not_found_members[:5])}"
                        f"{'...' if len(not_found_members) > 5 else ''}"
                    )
                
                return redirect('attendance_report', pk=attendance_record.id)
                
        except Exception as e:
            messages.error(request, f"Error processing file: {str(e)}")
            return redirect('upload_attendance')
    
    return render(request, 'attendance/upload.html')


def attendance_report(request, pk):
    record = get_object_or_404(AttendanceRecord, pk=pk)
    
    # Get present and absent members
    present = Attendance.objects.filter(record=record, present=True).select_related('member')
    absent = Attendance.objects.filter(record=record, present=False).select_related('member')
    
    summary = record.get_attendance_summary()
    
    context = {
        'record': record,
        'present': present,
        'absent': absent,
        'summary': summary
    }
    
    return render(request, 'attendance/report.html', context)


def export_attendance_excel(request, pk):
    from django.http import HttpResponse
    
    record = get_object_or_404(AttendanceRecord, pk=pk)
    
    # Create Excel writer
    output = BytesIO()
    writer = pd.ExcelWriter(output, engine='xlsxwriter')
    
    # Present members
    present_data = []
    for att in Attendance.objects.filter(record=record, present=True).select_related('member'):
        present_data.append({
            'First Name': att.member.first_name,
            'Middle Name': att.member.middle_name or '',
            'Last Name': att.member.last_name,
            'Phone': att.member.phone_number,
            'Gender': att.member.get_gender_display(),
            'Status': 'PRESENT'
        })
    
    # Absent members
    absent_data = []
    for att in Attendance.objects.filter(record=record, present=False).select_related('member'):
        absent_data.append({
            'First Name': att.member.first_name,
            'Middle Name': att.member.middle_name or '',
            'Last Name': att.member.last_name,
            'Phone': att.member.phone_number,
            'Gender': att.member.get_gender_display(),
            'Status': 'ABSENT'
        })
    
    # Write to Excel
    if present_data:
        pd.DataFrame(present_data).to_excel(writer, sheet_name='Present', index=False)
    if absent_data:
        pd.DataFrame(absent_data).to_excel(writer, sheet_name='Absent', index=False)
    
    writer.close()
    output.seek(0)
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename=attendance_{record.date}.xlsx'
    
    return response
