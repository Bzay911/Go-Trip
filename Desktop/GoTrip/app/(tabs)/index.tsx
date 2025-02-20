import { View, Text, SafeAreaView, ActivityIndicator, StyleSheet} from 'react-native'
import React, {useContext} from 'react'
import { PlacesContext } from '../placesContext'
import RecommendedPlacesList from '../recommendedPlacesList'

const index = () => {
  const {contextPlaces, contextLocation, contextWeather} = useContext(PlacesContext)

  return (
    <SafeAreaView style={{flex:1}}>
      <Text style={styles.mainTitle}>Travelling Today ?</Text>
       <Text style={styles.title}>Perfect Hangouts For {contextWeather} Weather</Text>
     <RecommendedPlacesList places={contextPlaces} location={contextLocation} />
    </SafeAreaView>
  )
}

export default index

const styles = StyleSheet.create({
  mainTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign:'left',
    margin: 16},
    
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign:'left',
    margin: 16},
})