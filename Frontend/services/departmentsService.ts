import { apiService } from '../utils/apiService';
import { Department } from '../types';

class DepartmentsService {
    async getDepartments(): Promise<Department[]> {
        return await apiService.get<Department[]>('/departments');
    }

    async createDepartment(name: string): Promise<Department> {
        return await apiService.post<Department>('/departments', { name });
    }

    async deleteDepartment(id: number): Promise<void> {
        await apiService.delete(`/departments/${id}`);
    }

    async seedDepartments(): Promise<void> {
        await apiService.post('/departments/seed', {});
    }
}

export const departmentsService = new DepartmentsService();
