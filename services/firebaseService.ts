
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  getDocs,
  deleteDoc,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { Project, UserProfile } from "../types";

let db: any = null;

export const initFirebase = (config: any) => {
  if (!config || !config.apiKey || !config.projectId) {
    console.warn("Firebase config is incomplete. Cloud sync disabled.");
    return false;
  }
  try {
    const app = initializeApp(config);
    db = getFirestore(app);
    console.log("Firebase Protocol Initialized: Cloud Vault Active");
    return true;
  } catch (e) {
    console.error("Firebase initialization failed", e);
    return false;
  }
};

const getUserId = () => {
    let id = localStorage.getItem('pf_user_id');
    if (!id) {
        id = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('pf_user_id', id);
    }
    return id;
};

// --- Profile Sync ---
export const saveProfileToCloud = async (profile: UserProfile) => {
  if (!db) return;
  try {
    const userId = getUserId();
    await setDoc(doc(db, "users", userId), profile, { merge: true });
  } catch (e) {
    console.error("Cloud Profile Save Failed", e);
  }
};

export const loadProfileFromCloud = async (): Promise<UserProfile | null> => {
  if (!db) return null;
  try {
    const userId = getUserId();
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? snap.data() as UserProfile : null;
  } catch (e) {
    console.error("Cloud Profile Load Failed", e);
    return null;
  }
};

// --- Project Sync ---
export const saveProjectToCloud = async (project: Project) => {
  if (!db) return;
  try {
    const userId = getUserId();
    const projectRef = doc(db, "users", userId, "projects", project.id);
    await setDoc(projectRef, project);
  } catch (e) {
    console.error("Cloud Project Save Failed", e);
  }
};

export const loadProjectsFromCloud = async (): Promise<Project[]> => {
  if (!db) return [];
  try {
    const userId = getUserId();
    const q = query(collection(db, "users", userId, "projects"));
    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      projects.push(doc.data() as Project);
    });
    return projects.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error("Cloud Projects Load Failed", e);
    return [];
  }
};

export const deleteProjectFromCloud = async (projectId: string) => {
  if (!db) return;
  try {
    const userId = getUserId();
    await deleteDoc(doc(db, "users", userId, "projects", projectId));
  } catch (e) {
    console.error("Cloud Project Deletion Failed", e);
  }
};

export const listenToProjects = (callback: (projects: Project[]) => void) => {
  if (!db) return () => {};
  const userId = getUserId();
  const q = query(collection(db, "users", userId, "projects"));
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const projects: Project[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => projects.push(doc.data() as Project));
    callback(projects.sort((a, b) => b.createdAt - a.createdAt));
  });
}
