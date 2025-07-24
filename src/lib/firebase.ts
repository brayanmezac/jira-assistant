import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, type DocumentData, type WithFieldValue, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, type User } from 'firebase/auth';
import type { ProjectCode, TaskCode, JiraSettings } from './types';

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

export async function updateUserSettings(userId: string, settings: Partial<JiraSettings>) {
    const docRef = doc(db, 'userSettings', userId);
    await setDoc(docRef, settings, { merge: true });
}


// Project Codes - These remain user-specific, stored under a user's document
// TODO: Refactor these to be user-specific if not already. For now, assuming they are global or need to be moved.
// For simplicity of this change, we will keep them global.

export async function getProjectCodes(): Promise<ProjectCode[]> {
    const snapshot = await getDocs(collection(db, 'projectCodes'));
    return snapshot.docs.map(doc => docToTyped<ProjectCode>(doc));
}

export async function addProjectCode(projectData: WithFieldValue<Omit<ProjectCode, 'id'>>): Promise<ProjectCode> {
    const docRef = await addDoc(collection(db, 'projectCodes'), projectData);
    return { id: docRef.id, ...projectData } as ProjectCode;
}

export async function updateProjectCode(id: string, projectData: Partial<Omit<ProjectCode, 'id'>>) {
    const docRef = doc(db, 'projectCodes', id);
    await updateDoc(docRef, projectData);
}

export async function deleteProjectCode(id: string) {
    const docRef = doc(db, 'projectCodes', id);
    await deleteDoc(docRef);
}

// Task Codes
export async function getTaskCodes(): Promise<TaskCode[]> {
    const snapshot = await getDocs(collection(db, 'taskCodes'));
    return snapshot.docs.map(doc => docToTyped<TaskCode>(doc));
}

export async function addTaskCode(taskData: WithFieldValue<Omit<TaskCode, 'id'>>): Promise<TaskCode> {
    const docRef = await addDoc(collection(db, 'taskCodes'), taskData);
    return { id: docRef.id, ...taskData } as TaskCode;
}

export async function updateTaskCode(id: string, taskData: Partial<Omit<TaskCode, 'id'>>) {
    const docRef = doc(db, 'taskCodes', id);
    await updateDoc(docRef, taskData);
}

export async function deleteTaskCode(id: string) {
    const docRef = doc(db, 'taskCodes', id);
    await deleteDoc(docRef);
}
