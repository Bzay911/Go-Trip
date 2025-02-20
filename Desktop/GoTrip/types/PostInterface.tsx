import { Timestamp } from "firebase/firestore";

export interface PostInterface {
    postId: string,
    userName: string,
    description: string;
    imageURL: string[]; 
    category: string;
    email: string;
    numberOfLikes: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}