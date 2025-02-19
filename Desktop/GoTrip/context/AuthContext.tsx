import { createContext } from "react"
import { Auth } from "@firebase/auth"
import { collection, getDocs } from "firebase/firestore";


export const AuthContext = createContext<Auth | any>( null )

