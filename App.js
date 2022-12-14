import React, { useEffect, useState, } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Button, TextInput, Alert  } from 'react-native';
import  Navigation from './components/Navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from './screens/OnboardingScreen';
import Home from './screens/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
// import { Button, TextInput } from 'react-native-paper';cd





const AppStack = createNativeStackNavigator();
const loggedInStates={
  NOT_LOGGED_IN: "NOT_LOGGED_IN",
  LOGGED_IN: "LOGGED_IN",
  CODE_SENT:"CODE_SENT",
}

const App = () =>{
  const [isFirstLaunch, setFirstLaunch] = React.useState(true);
  const [loggedInState,setLoggedInState] = React.useState(loggedInStates.NOT_LOGGED_IN);
  const [homeTodayScore, setHomeTodayScore] = React.useState(0);
  const [phoneNumber, setPhoneNumber]= React.useState("");
  const [oneTimePassword, setOneTimePassword]= React.useState(null);


  



  useEffect(()=>{
    const getSessionToken = async()=>{
      const sessionToken = await AsyncStorage.getItem('sessionToken');
      console.log('sessionToken', sessionToken);
      const validateResponse = await fetch('https://dev.stedi.me/validate/'+sessionToken, {
        method:'GET',
        headers:{
          'content-type': 'application/text'
        }

      });
      if (validateResponse.status==200){
        const userName = await validateResponse.text();
        
        AsyncStorage.setItem('userName', userName);
        console.log('userName', userName)

        setLoggedInState(loggedInStates.LOGGED_IN);

      }    }
      getSessionToken();

  })
   if (isFirstLaunch == true){
return(
  <OnboardingScreen setFirstLaunch={setFirstLaunch}/>
 
);
  } else if(loggedInState == loggedInStates.LOGGED_IN){
    return <Navigation/>
  }
 else if(loggedInState == loggedInStates.NOT_LOGGED_IN){
    return(
      <View>
        <TextInput style={styles.input}
        placeholderTextColor="#4251F5"
        placeholder= 'Phone Number'
        value= {phoneNumber}
        onChangeText= {setPhoneNumber}></TextInput>
        
        
        <Button 
        title = 'Send'
        style = {styles.button}
        onPress = {async()=>{
          console.log('Button was pressed')
        
          await fetch('https://dev.stedi.me/twofactorlogin/'+phoneNumber,
        {
          method: 'POST',
          headers:{
            'content-type':'application/text'
         
          }
          
        }
          )
          setLoggedInState(loggedInStates.CODE_SENT)
          }}
        />
      </View>
    )}
    else if (loggedInState == loggedInStates.CODE_SENT){
      return(
      <View>
        <TextInput 
          placeholder='One Time Password'
          style={styles.input}
          placeholderTextColor='#4251f5'
          value={oneTimePassword}
          onChangeText={setOneTimePassword}
          keyboardType = "numeric"
        >
        </TextInput>
        <Button
        title='Login'
          style={styles.button}
          onPress={async()=>{
            console.log('Login Button was pressed!')
            const loginResponse=await fetch ('https://dev.stedi.me/twofactorlogin',
            {
              method:'POST',
              headers:{
                'content-type':'application/text'
              },
              body:JSON.stringify({ 
                phoneNumber:phoneNumber, 
                oneTimePassword:oneTimePassword})
            });
            if (loginResponse.status==200){
              const sessionToken = await loginResponse.text();
              await AsyncStorage.setItem('sessionToken', sessionToken);
              setLoggedInState(loggedInStates.LOGGED_IN);
          } else{
            console.log('response status', loginResponse.status);
            Alert.alert('Invalid', "Invalid login information");
            setLoggedInState(loggedInStates.NOT_LOGGED_IN);
          }

           // setLoggedInState(loggedInStates.CODE_SENT)
            
          }}
        />
      </View>
    )
  }}
        
    

     
  export default App;
 const styles = StyleSheet.create({
 container:{
  flex:1, 
  alignItems:'center',
  justifyContent: 'center'
},
input: {
  marginTop:100,
height: 40,
margin: 12,
borderWidth: 1
}
 })