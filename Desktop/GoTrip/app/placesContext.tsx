import React, {createContext, useState} from "react";

export const PlacesContext = createContext();

export default function PlacesProvider({children}){
    const [contextPlaces, setContextPlaces] = useState([]);
    const [contextLocation, setContextLocation] = useState(null);
    const [contextWeather, setContextWeather] = useState(null);

    return(
        <PlacesContext.Provider value={{contextPlaces, setContextPlaces, contextLocation, setContextLocation, contextWeather, setContextWeather}}>
            {children}
        </PlacesContext.Provider>
    )
}