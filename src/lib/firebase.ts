
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, type DocumentData, type WithFieldValue, setDoc, getDoc, query, where, orderBy, writeBatch, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { ProjectCode, TaskCode, JiraSettings, GenerationHistoryEntry } from './types';

const firebaseConfig = {
  projectId: 'jira-assist-fpy59',
  appId: '1:940043119030:web:b763892dbcd35bfa87f917',
  storageBucket: 'jira-assist-fpy59.firebasestorage.app',
  apiKey: 'AIzaSyChaII6usaeh5aiLCFxbpJCgmVi8Xj1jzE',
  authDomain: 'jira-assist-fpy59.firebaseapp.com',
  messagingSenderId: '940043119030',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);


// Helper to convert Firestore doc to a typed object with ID
function docToTyped<T>(doc: DocumentData): T {
    return { id: doc.id, ...doc.data() } as T;
}

// User Settings
export async function getUserSettings(userId: string): Promise<JiraSettings | null> {
    const docRef = doc(db, 'userSettings', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as JiraSettings;
    }
    return null;
}

export async function updateUserSettings(userId: string, settings: JiraSettings) {
    const docRef = doc(db, 'userSettings', userId);
    await setDoc(docRef, settings);
}


// Project Codes - User-specific
export async function getProjectCodes(userId: string): Promise<ProjectCode[]> {
    const q = query(collection(db, 'projectCodes'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToTyped<ProjectCode>(doc));
}

export async function getProjectCode(id: string): Promise<ProjectCode | null> {
    const docRef = doc(db, 'projectCodes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docToTyped<ProjectCode>(docSnap);
    }
    return null;
}


export async function addProjectCode(projectData: WithFieldValue<Omit<ProjectCode, 'id'>>) {
    const docRef = await addDoc(collection(db, 'projectCodes'), projectData);
    const docSnap = await getDoc(docRef);
    return docToTyped<ProjectCode>(docSnap);
}

export async function updateProjectCode(id: string, projectData: Partial<Omit<ProjectCode, 'id' | 'userId'>>) {
    const docRef = doc(db, 'projectCodes', id);
    await updateDoc(docRef, projectData);
}

export async function deleteProjectCode(id: string) {
    const docRef = doc(db, 'projectCodes', id);
    await deleteDoc(docRef);
}

// Task Codes - User-specific
export async function getTaskCodes(userId: string): Promise<TaskCode[]> {
    const q = query(collection(db, 'taskCodes'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => docToTyped<TaskCode>(doc));
    // Sort in-memory to avoid needing a composite index
    tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return tasks;
}

export async function getTaskCode(id: string): Promise<TaskCode | null> {
    const docRef = doc(db, 'taskCodes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docToTyped<TaskCode>(docSnap);
    }
    return null;
}

export async function addTaskCode(taskData: WithFieldValue<Omit<TaskCode, 'id'>>): Promise<TaskCode> {
    const collectionRef = collection(db, 'taskCodes');
    
    // Get all tasks for the user to calculate the next order number, avoiding a complex query.
    const tasks = await getTaskCodes(taskData.userId);
    const lastOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) : -1;
    
    const dataWithOrder = { ...taskData, order: lastOrder + 1 };
    
    const docRef = await addDoc(collectionRef, dataWithOrder);
    const docSnap = await getDoc(docRef);
    return docToTyped<TaskCode>(docSnap);
}

export async function updateTaskCode(id: string, taskData: Partial<Omit<TaskCode, 'id' | 'userId'>>) {
    const docRef = doc(db, 'taskCodes', id);
    await updateDoc(docRef, taskData);
}

export async function batchUpdateTaskOrder(tasks: { id: string; order: number }[]) {
    const batch = writeBatch(db);
    tasks.forEach(task => {
        const docRef = doc(db, 'taskCodes', task.id);
        batch.update(docRef, { order: task.order });
    });
    await batch.commit();
}


export async function deleteTaskCode(id: string) {
    const docRef = doc(db, 'taskCodes', id);
    await deleteDoc(docRef);
}

// Generation History - Global
export async function addGenerationHistory(
  userId: string,
  historyPayload: Omit<GenerationHistoryEntry, 'id' | 'createdAt' | 'userId'>
) {
    const dataToSave = {
        ...historyPayload,
        userId: userId, // Ensure userId is correctly set
        createdAt: Timestamp.now(),
    };
    await addDoc(collection(db, 'generationHistory'), dataToSave);
}

export async function getGenerationHistory(): Promise<GenerationHistoryEntry[]> {
    const q = query(
        collection(db, 'generationHistory'),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToTyped<GenerationHistoryEntry>(doc));
}
