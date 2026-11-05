import EmployeeList from "@/components/employee/EmployeeList";

export const metadata = {
  title: "Data Karyawan",
};

export default function EmployeesPage() {
  return (  
    <div className="space-y-6">
      <EmployeeList />
    </div>
  );
}