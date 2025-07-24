'use client';

import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { projectCodeSchema, taskCodeSchema, type ProjectCode, type TaskCode } from './types';

type ActionResult<T> = {
    success: boolean;
    message: string;
    data?: T;
}

export async function addProjectCode(
    input: Omit<ProjectCode, 'id'>
): Promise<ActionResult<ProjectCode>> {
    const validatedFields = projectCodeSchema.safeParse(input);

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }

    try {
        const docRef = await addDoc(collection(db, 'projectCodes'), validatedFields.data);
        return { 
            success: true, 
            message: 'Project code added successfully.',
            data: { id: docRef.id, ...validatedFields.data }
        };
    } catch (error) {
        console.error('Error adding project code:', error);
        return { success: false, message: 'An error occurred while adding the project code.' };
    }
}

export async function addTaskCode(
    input: Omit<TaskCode, 'id'>
): Promise<ActionResult<TaskCode>> {
    const validatedFields = taskCodeSchema.safeParse(input);

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data.' };
    }
    
    try {
        const docRef = await addDoc(collection(db, 'taskCodes'), validatedFields.data);
        return { 
            success: true, 
            message: 'Task code added successfully.',
            data: { id: docRef.id, ...validatedFields.data }
        };
    } catch (error) {
        console.error('Error adding task code:', error);
        return { success: false, message: 'An error occurred while adding the task code.' };
    }
}
