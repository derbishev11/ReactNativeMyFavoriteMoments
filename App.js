import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Image, TouchableOpacity, Alert, TextInput} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [img, setImg] = useState();
  const [newImg, setNemImg] = useState();
  const [btn, setBtn] = useState(true);

  const [quote, setQuote] = useState();

  const [captionFromDatabase, setCaptionFromDatabase] = useState('');
  const [uriFromDatabase, setUriFromDatabase] = useState('');

  const db = SQLite.openDatabase('MomemntsDB');

  /* IMAGE FUNCTIONS */
  const getPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if(cameraPermission.status !== 'granted' && libraryPermission.status !== 'granted')
    {
      Alert.alert('Insufficient Permissions!', 
        'You need to grant camera permissions to use this app.', 
        [{text: 'Yes'}])
        return false
    }
    return true;
  }

  const getImageFromGallery = async () => {
    const hasPermission = await getPermissions();
    if(!hasPermission)
    {
      return false;
    }
    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5
    })
    if(!image.cancelled) {
      setImg(image.uri)
    }
  }

  const getImageFromCamera = async () => {
    const hasPermission = await getPermissions();
    if(!hasPermission)
    {
      return false;
    }
    const image = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.5
    })
    if(!image.cancelled) {
      setImg(image.uri)
    }
  }

  // const imageHandler = () => {
  //   Alert.alert("Photo","Please Choose How You Want Upload the Image",
  //     [{text:"Take a new photo", onPress: getImageFromCamera }, 
  //     {text:"Take a photo from gallery", onPress: getImageFromGallery}])
  // }


  /* FILE FUNCTIONS */

  const moveImage = () => {
    const fileName = img.split("/").pop();
    const newUri = FileSystem.documentDirectory + fileName;
    // console.log(fileName + " FILE NAME");
    // console.log(newUri + " NEW URI");
    // console.log(FileSystem.documentDirectory + " File Dir")
    // console.log(img + " SetImage")
    try
    {
      FileSystem.moveAsync({
        from: img,
        to: newUri
      })
      setImg(newUri)
    }
    catch(error)
    {
      console.log(error)
    }

  }

  console.log(img)

  // console.log(newImg + " NEW IMG")
  /* HANDLERS */
  const inputHandler = (value) => {
    setQuote(value)
  }

  /* DATABASE FUNCTIONS */

  useEffect(() => {
    createTable();
    getDataFromDatabase();
  }, []);

  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS Momemnt (id INTEGER PRIMARY KEY NOT NULL, caption TEXT, source TEXT);',)
    })
  }

  const insertData = () => {
    try {
        db.transaction(tx => {
          tx.executeSql('INSERT INTO Momemnt (caption, source) values (?, ?)',
        [quote, img],
        )
      })
      getDataFromDatabase()
    }
    catch (error) {
      console.log(error)
    }
  }

  const getDataFromDatabase = () => {
    db.transaction(
      (tx) =>
      {
        tx.executeSql('SELECT * FROM Momemnt',
        [],
        (tx, result) => {
          let rowLength = result.rows.length;
          if(rowLength > 0)
          {
            let momemntCaption = result.rows.item(13).caption
            let momemntUri = result.rows.item(13).source
            setCaptionFromDatabase(momemntCaption)
            setUriFromDatabase(momemntUri);
            
          }
        })
      }
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.txtStyle}>My Favourite Moment!</Text>
      <Text style={styles.txtStyle}>t_derbishev</Text>
      
        {
          !img &&
          <TouchableOpacity onPress={getImageFromGallery}>
            <Image style={{width:150, height:150, marginHorizontal: 120, marginVertical: 20}} source={require('./pngaaa.com-1915717.png')}></Image>
          </TouchableOpacity>
        }
        {
          img &&
          <View>
            <TouchableOpacity>
            <Image style={{width:150, height:150, marginHorizontal: 120, marginVertical: 20}} source={{uri: img}}/>
            </TouchableOpacity>
          </View>
        }

      <TextInput style={styles.textInpt} multiline={true} numberOfLines={10} onChangeText={inputHandler} placeholder={"Add your quote/caption here..."}/>
      {
        btn &&
        <View style={styles.btn}>
          <Button title='Save' color="#ff631b" onPress={() => {moveImage(), setBtn(false)}}></Button>
          <Button title='Save To Dabase' onPress = {() => {insertData()}} />
        </View>
      }
      <Text>{captionFromDatabase + " " + uriFromDatabase}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtStyle: {
    fontSize: 20
  },
  textInpt: {
    marginVertical: 10,
    borderWidth: 1,
    justifyContent: "flex-start",
    textAlignVertical: 'top',
    fontSize: 16,
    width: 400
  },
  btn: {
    width: 400
  },

});
