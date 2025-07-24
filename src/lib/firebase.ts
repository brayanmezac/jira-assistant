import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { initializeAuth, getAuth, indexedDBLocalPersistence } from 'firebase/auth';
import type { ProjectCode, TaskCode } from './types';

const firebaseConfig = {
  projectId: 'jira-assist-fpy59',
  appId: '1:940043119030:web:b763892dbcd35bfa87f917',
  storageBucket: 'jira-assist-fpy59.firebasestorage.app',
  apiKey: 'AIzaSyChaII6usaeh5aiLCFxbpJCgmVi8Xj1jzE',
  authDomain: 'jira-assist-fpy59.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '940043119030',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Explicitly initialize Auth with the correct domain and persistence
export const auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence,
});
auth.tenantId = firebaseConfig.authDomain;


export async function getProjectCodes(): Promise<ProjectCode[]> {
    const projectsCol = collection(db, 'projectCodes');
    const q = query(projectsCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectCode));
}

export async function getTaskCodes(): Promise<TaskCode[]> {
    const tasksCol = collection(db, 'taskCodes');
    const q = query(tasksCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskCode));
}

export async function getSubtasks(): Promise<TaskCode[]> {
    return getTaskCodes();
}
