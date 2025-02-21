import { createContext } from "react"
import {Auth} from "@firebase/auth"

// intitalizing and declaring auth context with null
export const AuthContext = createContext<Auth | any>(null)