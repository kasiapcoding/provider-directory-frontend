import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { PanelModule } from 'primeng/panel';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DoctorService, Doctor } from '../doctor.service';

const ALL_LOCATIONS = ['Baltimore', 'Annapolis', 'Catonsville', 'Towson', 'Columbia', 'Woodlawn', 'Rockville', 'Bethesda'];
const SPECIALIZATIONS = ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'Dermatology', 'General Practice'];

@Component({
  selector: 'app-doctorsfull',
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    InputTextModule,
    MultiSelectModule,
    RadioButtonModule,
    SelectModule,
    SplitButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    ToolbarModule,
    PanelModule,
  ],
  templateUrl: './doctorsfull.html',
  styleUrl: './doctorsfull.css',
  providers: [MessageService, ConfirmationService],
})
export class Doctorsfull implements OnInit {
  @ViewChild('dt') dt!: Table;

  private doctorService = inject(DoctorService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  doctors: Doctor[] = [];
  doctor: Doctor = this.blank();
  selectedDoctors: Doctor[] = [];
  doctorDialog = false;
  submitted = false;
  loading = true;

  readonly specializations = SPECIALIZATIONS;
  readonly allLocations = ALL_LOCATIONS.map((l) => ({ label: l, value: l }));

  exportItems: MenuItem[] = [
    { label: 'Excel', icon: 'pi pi-file-excel', iconStyle: { color: '#16a34a' }, command: () => this.exportExcel() },
    { label: 'PDF', icon: 'pi pi-file-pdf', iconStyle: { color: '#dc2626' }, command: () => this.exportPDF() },
  ];

  ngOnInit(): void {
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private blank(): Doctor {
    return { id: 0, firstName: '', lastName: '', age: 30, specialization: '', locations: [] };
  }

  clearFilters(): void {
    this.dt.clear();
  }

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  this.doctorService.uploadXml(formData).subscribe({
    next: () => {
      this.loadDoctors(); // refetch full list from /api/doctors
    },
    error: (err) => {
      console.error('Upload failed', err);
    }
  });

  input.value = '';
}

loadDoctors(): void {
  this.doctorService.getDoctors().subscribe(data => this.doctors = data);
}

  openNew(): void {
    this.doctor = this.blank();
    this.submitted = false;
    this.doctorDialog = true;
  }

  editDoctor(doctor: Doctor): void {
    this.doctor = { ...doctor, locations: [...doctor.locations] };
    this.doctorDialog = true;
  }

  hideDialog(): void {
    this.doctorDialog = false;
    this.submitted = false;
  }

  saveDoctor(): void {
    this.submitted = true;
    if (!this.doctor.firstName?.trim() || !this.doctor.lastName?.trim()) return;

    if (this.doctor.id) {
      const idx = this.doctors.findIndex((d) => d.id === this.doctor.id);
      if (idx !== -1) this.doctors[idx] = { ...this.doctor };
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Doctor updated', life: 3000 });
    } else {
      this.doctor.id = Math.max(0, ...this.doctors.map((d) => d.id)) + 1;
      this.doctors.push({ ...this.doctor });
      this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Doctor added', life: 3000 });
    }

    this.doctors = [...this.doctors];
    this.doctorDialog = false;
    this.doctor = this.blank();
  }

  deleteDoctor(doctor: Doctor): void {
    this.confirmationService.confirm({
      message: `Delete Dr. ${doctor.firstName} ${doctor.lastName}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', variant: 'text' },
      acceptButtonProps: { severity: 'danger', label: 'Yes' },
      accept: () => {
        this.doctors = this.doctors.filter((d) => d.id !== doctor.id);
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Doctor removed', life: 3000 });
      },
    });
  }

  deleteSelectedDoctors(): void {
    this.confirmationService.confirm({
      message: 'Delete the selected doctors?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', variant: 'text' },
      acceptButtonProps: { severity: 'danger', label: 'Yes' },
      accept: () => {
        this.doctors = this.doctors.filter((d) => !this.selectedDoctors.includes(d));
        this.selectedDoctors = [];
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Doctors removed', life: 3000 });
      },
    });
  }

  onGlobalFilter(event: Event): void {
    this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportCSV(): void {
    this.dt.exportCSV();
  }

  exportExcel(): void {
    const rows = this.doctors.map((d) => ({
      ID: d.id,
      'First Name': d.firstName,
      'Last Name': d.lastName,
      Age: d.age,
      Specialization: d.specialization,
      Locations: d.locations.join(', '),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Doctors');
    XLSX.writeFile(wb, 'doctors.xlsx');
  }


  exportPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['ID', 'First Name', 'Last Name', 'Age', 'Specialization', 'Locations']],
      body: this.doctors.map((d) => [d.id, d.firstName, d.lastName, d.age, d.specialization, d.locations.join(', ')]),
    });
    doc.save('doctors.pdf');
  }

  getSpecializationSeverity(spec: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      Cardiology: 'danger',
      Pediatrics: 'success',
      Orthopedics: 'warn',
      Neurology: 'info',
      Dermatology: 'secondary',
      'General Practice': 'secondary',
    };
    return map[spec] ?? 'secondary';
  }
}
