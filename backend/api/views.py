# views.py - Converted to REST API for React
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.db import transaction
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
import pandas as pd
from io import BytesIO
from .models import Members, Attendance, AttendanceRecord


# ============================================
# GET ALL MEMBERS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_members(request):
    """Get all members with optional search and filtering"""
    print("👥 Fetching all members...")
    
    # Get query parameters
    search = request.GET.get('search', '')
    ministry = request.GET.get('ministry', '')
    gender = request.GET.get('gender', '')
    
    members = Members.objects.all()
    
    # Apply filters
    if search:
        members = members.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(middle_name__icontains=search) |
            Q(phone_number__icontains=search) |
            Q(email__icontains=search)
        )
    
    if ministry:
        members = members.filter(ministry=ministry)
    
    if gender:
        members = members.filter(gender=gender)
    
    members = members.order_by('first_name', 'last_name')
    
    members_data = [{
        'id': member.id,
        'first_name': member.first_name,
        'middle_name': member.middle_name or '',
        'last_name': member.last_name,
        'full_name': member.get_full_name(),
        'gender': member.gender,
        'gender_display': member.get_gender_display(),
        'phone_number': member.phone_number,
        'date_of_birth': member.date_of_birth,
        'married_status': member.married_status,
        'married_status_display': member.get_married_status_display(),
        'home_address': member.home_address,
        'occupation': member.occupation,
        'place_of_work': member.place_of_work,
        'church_membership_status': member.church_membership_status,
        'church_membership_status_display': member.get_church_membership_status_display(),
        'ministry': member.ministry,
        'ministry_display': member.get_ministry_display(),
    } for member in members]
    
    print(f"✅ Found {len(members_data)} members")
    
    return Response({
        'members': members_data,
        'total': len(members_data)
    })

# ============================================
# GET SINGLE MEMBER
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_member(request, pk):
    """Get single member details"""
    member = get_object_or_404(Members, pk=pk)
    
    member_data = {
        'id': member.id,
        'first_name': member.first_name,
        'middle_name': member.middle_name or '',
        'last_name': member.last_name,
        'gender': member.gender,
        'phone_number': member.phone_number,
        'date_of_birth': member.date_of_birth,
        'married_status': member.married_status,
        'home_address': member.home_address,
        'occupation': member.occupation,
        'place_of_work': member.place_of_work,
        'church_membership_status': member.church_membership_status,
        'ministry': member.ministry,
    }
    
    return Response(member_data)

# ============================================
# CREATE MEMBER
# ============================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_member(request):
    """Create a new member"""
    print("➕ Creating new member...")
    print(f"📋 Data: {request.data}")
    
    required_fields = ['first_name', 'last_name', 'phone_number', 'date_of_birth']
    
    # Validate required fields
    for field in required_fields:
        if not request.data.get(field):
            return Response(
                {'error': f'{field} is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Check for duplicate
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    middle_name = request.data.get('middle_name') or None
    
    existing = Members.objects.filter(
        first_name__iexact=first_name,
        last_name__iexact=last_name,
        middle_name__iexact=middle_name
    ).exists()
    
    if existing:
        return Response(
            {'error': 'Member with this name already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        member = Members.objects.create(
            first_name=request.data.get('first_name'),
            middle_name=request.data.get('middle_name') or None,
            last_name=request.data.get('last_name'),
            gender=request.data.get('gender', 'M'),
            phone_number=request.data.get('phone_number'),
            date_of_birth=request.data.get('date_of_birth'),
            married_status=request.data.get('married_status', 'S'),
            home_address=request.data.get('home_address', ''),
            occupation=request.data.get('occupation', ''),
            place_of_work=request.data.get('place_of_work', ''),
            church_membership_status=request.data.get('church_membership_status', 'M'),
            ministry=request.data.get('ministry', 'Y'),
        )
        
        print(f"✅ Member created: {member.get_full_name()}")
        
        return Response({
            'id': member.id,
            'message': 'Member created successfully',
            'member': {
                'id': member.id,
                'full_name': member.get_full_name(),
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ============================================
# UPDATE MEMBER
# ============================================
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_member(request, pk):
    """Update member details"""
    print(f"✏️ Updating member ID: {pk}")
    
    member = get_object_or_404(Members, pk=pk)
    
    # Update fields
    member.first_name = request.data.get('first_name', member.first_name)
    member.middle_name = request.data.get('middle_name') or None
    member.last_name = request.data.get('last_name', member.last_name)
    member.gender = request.data.get('gender', member.gender)
    member.phone_number = request.data.get('phone_number', member.phone_number)
    member.date_of_birth = request.data.get('date_of_birth', member.date_of_birth)
    member.married_status = request.data.get('married_status', member.married_status)
    member.home_address = request.data.get('home_address', member.home_address)
    member.occupation = request.data.get('occupation', member.occupation)
    member.place_of_work = request.data.get('place_of_work', member.place_of_work)
    member.church_membership_status = request.data.get('church_membership_status', member.church_membership_status)
    member.ministry = request.data.get('ministry', member.ministry)
    
    member.save()
    
    print(f"✅ Member updated: {member.get_full_name()}")
    
    return Response({
        'message': 'Member updated successfully',
        'member': {
            'id': member.id,
            'full_name': member.get_full_name(),
        }
    })

# ============================================
# DELETE MEMBER
# ============================================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_member(request, pk):
    """Delete a member"""
    print(f"🗑️ Deleting member ID: {pk}")
    
    member = get_object_or_404(Members, pk=pk)
    full_name = member.get_full_name()
    
    member.delete()
    
    print(f"✅ Deleted member: {full_name}")
    
    return Response({
        'message': f'Member {full_name} deleted successfully',
        'deleted_id': pk
    }, status=status.HTTP_200_OK)


# views.py - Updated import_members with correct column mapping
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def import_members(request):
    """Bulk import members from Excel file"""
    print("📥 Importing members from Excel...")
    
    excel_file = request.FILES.get('excel_file')
    
    if not excel_file:
        return Response(
            {'error': 'Excel file is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        df = pd.read_excel(excel_file)
        print(f"📊 Excel columns found: {df.columns.tolist()}")
        
        # Clean column names - convert to lowercase and strip spaces
        df.columns = df.columns.str.strip().str.lower()
        
        print(f"📊 Columns after lowercase: {df.columns.tolist()}")
        
        # UPDATED COLUMN MAPPING - with spaces!
        column_mapping = {
            'first name': 'first_name',
            'middle name': 'middle_name',
            'last name': 'last_name',
            'date of birth': 'date_of_birth',
            'phone number': 'phone_number',
            'alternative phone number': 'alternative_phone',
            'home address (digital address or  land mark)': 'home_address',
            'occupation/profession': 'occupation',
            'place of work/institutional name (include class/level if a student)': 'place_of_work',
            'marital status': 'married_status',
            'church membership status': 'church_membership_status',
            'department / squad (select many as you can)': 'department',
        }
        
        # Apply column mapping
        df = df.rename(columns=column_mapping)
        
        print(f"📊 Columns after mapping: {df.columns.tolist()}")
        
        # Check required columns
        required_cols = ['first_name', 'last_name', 'phone_number', 'date_of_birth']
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            return Response(
                {
                    'error': f'Missing required columns: {", ".join(missing_cols)}',
                    'found_columns': df.columns.tolist()
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_count = 0
        skipped_count = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                # Get names
                first_name = str(row.get('first_name', '')).strip()
                last_name = str(row.get('last_name', '')).strip()
                middle_name = str(row.get('middle_name', '')).strip()
                
                # Skip if essential names are missing
                if not first_name or not last_name or first_name.lower() == 'nan' or last_name.lower() == 'nan':
                    skipped_count += 1
                    continue
                
                # Handle middle name - ALLOW NULL
                if not middle_name or middle_name.lower() == 'nan' or middle_name == '':
                    middle_name = None
                
                # Clean phone number - REMOVE SPACES AND INVALID CHARS
                phone_raw = str(row.get('phone_number', '')).strip()
                
                # Handle phone numbers starting with 'O' (letter O instead of 0)
                if phone_raw.upper().startswith('O'):
                    phone_raw = '0' + phone_raw[1:]
                
                # Remove all non-digit characters
                phone_number = ''.join(filter(str.isdigit, phone_raw))
                
                # Skip if phone is invalid
                if not phone_number or len(phone_number) < 9:
                    errors.append(f"Row {idx + 2}: Invalid phone number '{phone_raw}'")
                    skipped_count += 1
                    continue
                
                # Truncate if too long (max 15 digits)
                if len(phone_number) > 15:
                    phone_number = phone_number[:15]
                
                # Check if member exists
                existing = Members.objects.filter(
                    first_name__iexact=first_name,
                    last_name__iexact=last_name
                ).exists()
                
                if existing:
                    print(f"⚠️ Skipping duplicate: {first_name} {last_name}")
                    skipped_count += 1
                    continue
                
                # Parse date of birth
                try:
                    dob = pd.to_datetime(row.get('date_of_birth')).date()
                except:
                    errors.append(f"Row {idx + 2}: Invalid date format")
                    skipped_count += 1
                    continue
                
                # Parse gender
                gender_val = str(row.get('gender', 'M')).strip().upper()
                if gender_val in ['MALE', 'M', 'MAN']:
                    gender = 'M'
                elif gender_val in ['FEMALE', 'F', 'WOMAN']:
                    gender = 'F'
                else:
                    gender = 'M'
                
                # Parse marital status
                marital_val = str(row.get('married_status', 'S')).strip().upper()
                if marital_val in ['MARRIED', 'M', 'YES']:
                    married_status = 'M'
                elif marital_val in ['SINGLE', 'S', 'NO']:
                    married_status = 'S'
                elif marital_val in ['DIVORCED', 'D']:
                    married_status = 'D'
                elif marital_val in ['WIDOWED', 'W']:
                    married_status = 'W'
                else:
                    married_status = 'S'
                
                # Parse church membership status
                church_status_val = str(row.get('church_membership_status', 'M')).strip().upper()
                if church_status_val in ['MEMBER', 'M']:
                    church_status = 'M'
                elif church_status_val in ['VISITOR', 'V']:
                    church_status = 'V'
                elif church_status_val in ['NEW CONVERT', 'N', 'NEW']:
                    church_status = 'N'
                else:
                    church_status = 'M'
                
                # Parse ministry
                ministry_val = str(row.get('ministry', 'Y')).strip().upper()
                if ministry_val in ['YOUTH', 'Y']:
                    ministry = 'Y'
                elif ministry_val in ['CHILDREN', 'C']:
                    ministry = 'C'
                elif ministry_val in ['WOMEN', 'W']:
                    ministry = 'W'
                elif ministry_val in ['MEN', 'M']:
                    ministry = 'M'
                elif ministry_val in ['USHER', 'U']:
                    ministry = 'U'
                else:
                    ministry = 'O'  # Other
                
                # Create member
                member = Members.objects.create(
                    first_name=first_name,
                    middle_name=middle_name,
                    last_name=last_name,
                    gender=gender,
                    phone_number=phone_number,
                    date_of_birth=dob,
                    married_status=married_status,
                    home_address=str(row.get('home_address', '')).strip() or '',
                    occupation=str(row.get('occupation', '')).strip() or '',
                    place_of_work=str(row.get('place_of_work', '')).strip() or '',
                    church_membership_status=church_status,
                    ministry=ministry,
                )
                
                print(f"✅ Created: {member.get_full_name()}")
                created_count += 1
                
            except Exception as e:
                error_msg = str(e)
                errors.append(f"Row {idx + 2}: {error_msg}")
                print(f"❌ Error on row {idx + 2}: {error_msg}")
                skipped_count += 1
        
        print(f"✅ Import complete: {created_count} created, {skipped_count} skipped")
        
        return Response({
            'message': 'Import completed successfully',
            'created': created_count,
            'skipped': skipped_count,
            'total_rows': len(df),
            'errors': errors[:20] if errors else [],
            'success': True
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================
# GET MEMBER STATISTICS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_statistics(request):
    """Get member statistics"""
    total = Members.objects.count()
    male = Members.objects.filter(gender='M').count()
    female = Members.objects.filter(gender='F').count()
    
    by_ministry = {}
    for choice in Members._meta.get_field('ministry').choices:
        code = choice[0]
        name = choice[1]
        count = Members.objects.filter(ministry=code).count()
        by_ministry[name] = count
    
    return Response({
        'total': total,
        'male': male,
        'female': female,
        'by_ministry': by_ministry
    })


# ============================================
# ATTENDANCE HISTORY - GET ALL RECORDS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_history(request):
    """Get all attendance records as JSON"""
    print("📊 Fetching attendance history...")
    
    records = AttendanceRecord.objects.all().annotate(
        present_count=Count('attendances', filter=Q(attendances__present=True)),
        absent_count=Count('attendances', filter=Q(attendances__present=False))
    ).order_by('-date')
    
    records_data = [{
        'id': record.id,
        'date': record.date,
        'service_type': record.service_type,
        'present_count': record.present_count,
        'absent_count': record.absent_count,
        'created_at': record.created_at,
    } for record in records]
    
    print(f"✅ Found {len(records_data)} records")
    
    return Response({
        'records': records_data,
        'total_records': len(records_data)
    })


# ============================================
# UPLOAD ATTENDANCE - POST WITH FILE
# ============================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_attendance(request):
    """Upload attendance from Excel file - returns JSON"""
    print("📥 Upload request received")
    print(f"📋 Request data: {request.data}")
    print(f"📁 Files: {request.FILES}")
    
    service_date = request.data.get('service_date')
    service_type = request.data.get('service_type', 'Sunday Service')
    excel_file = request.FILES.get('excel_file')
    
    print(f"📅 Date: {service_date}")
    print(f"⛪ Service: {service_type}")
    print(f"📄 File: {excel_file.name if excel_file else 'No file'}")
    
    # Validation
    if not service_date:
        return Response(
            {'error': 'Service date is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not service_type:
        return Response(
            {'error': 'Service type is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not excel_file:
        return Response(
            {'error': 'Excel file is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Read Excel file
        df = pd.read_excel(excel_file)
        print(f"📊 Excel columns: {df.columns.tolist()}")
        print(f"📊 Total rows: {len(df)}")

        # Clean column names (strip whitespace and convert to lowercase)
        df.columns = df.columns.str.strip().str.lower()

        # Get or create attendance record 
        with transaction.atomic():
            attendance_record, created = AttendanceRecord.objects.get_or_create(
                date=service_date,
                service_type=service_type
            )
            
            print(f"{'✨ Created new' if created else '🔄 Updated existing'} attendance record")

            # Clear existing attendance for this record 
            Attendance.objects.filter(record=attendance_record).delete()

            # Track statistics 
            present_members = []
            not_found_members = []

            # Process Excel rows - matching first_name, last_name, middle_name
            for idx, row in df.iterrows():
                first_name = str(row.get('first_name', '')).strip()
                last_name = str(row.get('last_name', '')).strip()
                middle_name = str(row.get('middle_name', '')).strip()

                # Skip if essential names are missing 
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
            
            print(f"✅ Present: {len(present_members)}, Absent: {absent_members.count()}")
            
            # Return JSON response
            return Response({
                'id': attendance_record.id,
                'message': 'Attendance uploaded successfully',
                'present_count': len(present_members),
                'absent_count': absent_members.count(),
                'not_found': not_found_members[:5] if not_found_members else [],
                'total_not_found': len(not_found_members)
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return Response(
            {'error': f'Error processing file: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================
# ATTENDANCE REPORT - GET SINGLE RECORD DETAILS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_report(request, pk):
    """Get detailed attendance report as JSON"""
    print(f"📋 Fetching report for record ID: {pk}")
    
    record = get_object_or_404(AttendanceRecord, pk=pk)
    
    # Get present and absent members
    present = Attendance.objects.filter(record=record, present=True).select_related('member')
    absent = Attendance.objects.filter(record=record, present=False).select_related('member')
    
    summary = record.get_attendance_summary()
    
    # Serialize present members
    present_data = [{
        'id': att.id,
        'member': {
            'id': att.member.id,
            'first_name': att.member.first_name,
            'middle_name': att.member.middle_name or '',
            'last_name': att.member.last_name,
            'phone_number': att.member.phone_number,
            'gender': att.member.get_gender_display(),
            'ministry': att.member.get_ministry_display(),
        }
    } for att in present]
    
    # Serialize absent members
    absent_data = [{
        'id': att.id,
        'member': {
            'id': att.member.id,
            'first_name': att.member.first_name,
            'middle_name': att.member.middle_name or '',
            'last_name': att.member.last_name,
            'phone_number': att.member.phone_number,
            'gender': att.member.get_gender_display(),
            'ministry': att.member.get_ministry_display(),
        }
    } for att in absent]
    
    print(f"✅ Report generated - Present: {len(present_data)}, Absent: {len(absent_data)}")
    
    return Response({
        'record': {
            'id': record.id,
            'date': record.date,
            'service_type': record.service_type,
            'created_at': record.created_at,
        },
        'present': present_data,
        'absent': absent_data,
        'summary': summary
    })


# ============================================
# EXPORT ATTENDANCE - DOWNLOAD EXCEL FILE
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_attendance_excel(request, pk):
    """Export attendance to Excel file"""
    print(f"📥 Exporting attendance for record ID: {pk}")
    
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
    
    print(f"✅ Excel file generated")
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename=attendance_{record.date}.xlsx'
    
    return response


# ============================================
# DELETE ATTENDANCE RECORD
# ============================================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_attendance_record(request, pk):
    """Delete an attendance record - returns JSON"""
    print(f"🗑️ Deleting attendance record ID: {pk}")
    
    record = get_object_or_404(AttendanceRecord, pk=pk)
    date = record.date
    service_type = record.service_type
    
    record.delete()
    
    print(f"✅ Deleted record for {date} - {service_type}")
    
    return Response({
        'message': f'Attendance record for {date} has been deleted',
        'deleted_id': pk
    }, status=status.HTTP_200_OK)


# ============================================
# BONUS: GET ATTENDANCE STATISTICS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_statistics(request):
    """Get overall attendance statistics"""
    total_records = AttendanceRecord.objects.count()
    total_members = Members.objects.count()
    
    # Get latest record stats
    latest_record = AttendanceRecord.objects.order_by('-date').first()
    
    if latest_record:
        latest_summary = latest_record.get_attendance_summary()
    else:
        latest_summary = {
            'total_members': total_members,
            'present': 0,
            'absent': 0,
            'attendance_rate': 0
        }
    
    return Response({
        'total_records': total_records,
        'total_members': total_members,
        'latest_record': {
            'id': latest_record.id if latest_record else None,
            'date': latest_record.date if latest_record else None,
            'service_type': latest_record.service_type if latest_record else None,
            'summary': latest_summary
        } if latest_record else None
    })