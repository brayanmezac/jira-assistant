import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, type DocumentData, type WithFieldValue, setDoc, getDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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


export async function addProjectCode(projectData: WithFieldValue<Omit<ProjectCode, 'id'>>): Promise<ProjectCode> {
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
    return snapshot.docs.map(doc => docToTyped<TaskCode>(doc));
}

export async function addTaskCode(taskData: WithFieldValue<Omit<TaskCode, 'id'>>): Promise<TaskCode> {
    const docRef = await addDoc(collection(db, 'taskCodes'), taskData);
    const docSnap = await getDoc(docRef);
    return docToTyped<TaskCode>(docSnap);
}

export async function updateTaskCode(id: string, taskData: Partial<Omit<TaskCode, 'id' | 'userId'>>) {
    const docRef = doc(db, 'taskCodes', id);
    await updateDoc(docRef, taskData);
}

export async function deleteTaskCode(id: string) {
    const docRef = doc(db, 'taskCodes', id);
    await deleteDoc(docRef);
}
