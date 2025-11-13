from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

# Create your models here.


GENDER_CHOICES = [('M', 'Male'), ('F', 'Female')]
MARITAL_STATUS = [('S', 'Single'), ('M', 'Married'), ('D', 'Divorced'), ('W', 'Widowed')]
CHURCH_MEMBERSHIP_STATUS = [('M', 'Member'), ('V', 'Visitor'), ('N', 'New Convert')]
MINISTRY = [('Y', 'Youth'), ('C', 'Children'), ('W', 'Women'), ('M', 'Men'), ('U', 'Usher'), ('O', 'Other')]

class Members(models.Model):
    first_name = models.CharField(max_length=100, null=False)
    middle_name = models.CharField(max_length=100, blank=True, null=True)  # ✅ Allow NULL
    last_name = models.CharField(max_length=100, null=False)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    phone_number = models.CharField(max_length=20, null=False)  # ✅ Changed from IntegerField to CharField
    date_of_birth = models.DateField()
    married_status = models.CharField(max_length=1, choices=MARITAL_STATUS, default='S')
    home_address = models.CharField(max_length=200, blank=True, default='')
    occupation = models.CharField(max_length=200, blank=True, default='')
    place_of_work = models.CharField(max_length=200, blank=True, default='')
    church_membership_status = models.CharField(max_length=1, choices=CHURCH_MEMBERSHIP_STATUS, default='M')
    ministry = models.CharField(max_length=1, choices=MINISTRY, default='Y')

    class Meta:
        verbose_name_plural = "Members"
        #unique_together = ['first_name', 'last_name', 'middle_name']

    def __str__(self):
        return self.get_full_name()
    
    def get_full_name(self):
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
class AttendanceRecord(models.Model):
    date = models.DateTimeField(default=timezone.now)
    service_type = models.CharField(max_length=50, default='Sunday Service')
    created_at = models.DateTimeField(auto_now_add=True)


class Meta:
    unique_together = ['date', 'service_type']
    ordering = ['-date']

    def __str__(self):
        return f"{self.service_type} - {self.date}"
    
    def get_attendance_summary(self):
        """Get summary of attendance for this record"""""
        total_members = Members.objects.count()
        present_count = self.attendances.count()
        absent_count = total_members - present_count

        return {
            'total_members' : total_members,
            'present': present_count,
            'absent': absent_count,
            'attendance_rate': (present_count / total_members * 100) if total_members > 0 else 0
        }

class Attendance(models.Model):
    member = models.ForeignKey(Members, on_delete=models.CASCADE, related_name='attendances')
    record = models.ForeignKey(AttendanceRecord, on_delete=models.CASCADE, related_name='attendances')
    present = models.BooleanField(default=True)
    remarks = models.TextField(blank=True, null=True)

class Meta:
    unique_together = ['member', 'record']

    def __str__(self):
        return f"{self.member.get_full_name()} - {self.record.date} - {'Present' if self.present else 'absent'}"
    