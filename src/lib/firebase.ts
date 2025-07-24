import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { ProjectCode, TaskCode } from './types';

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


export async function getProjectCodes(): Promise<ProjectCode[]> {
    const projectsCol = collection(db, 'projectCodes');
    const projectsSnapshot = await getDocs(projectsCol);
    const projectsList = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ProjectCode[];
    return projectsList;
  }
  
  export async function getTaskCodes(): Promise<TaskCode[]> {
    const tasksCol = collection(db, 'taskCodes');
    const tasksSnapshot = await getDocs(tasksCol);
    const tasksList = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TaskCode[];
    return tasksList;
  }
