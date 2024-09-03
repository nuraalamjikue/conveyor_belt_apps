import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  Pressable,
  TextInput,
  Button,
  ImageBackground,
  StatusBar,
  BackHandler,
} from 'react-native';
import axios from 'axios';
const {height, width} = Dimensions.get('window');
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import MQTT from 'sp-react-native-mqtt';
import Toast from 'react-native-toast-message';
import Spinner from 'react-native-loading-spinner-overlay';
import instance from '../../Axiosinstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import jwtDecode from 'jwt-decode';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {Icon, IconButton} from 'react-native-paper';
interface Item {
  Id: number;
  itemCode: string;
  itemDesc: string;
  ItemNames: string;
  quantity: number;
  ItemsRate: number;
  localRate: number;
  image: string;
  ImageUrl: string;
  Count: number;
  CurrentBalance: number;
  driveAddress: number;
}

type RootStackParamList = {
  BkashPaymentGetway: {
    TatalSelectedData: any;
    TotalAmount: number;
    InvoiceMasterID: number;
  };
};

type AuthLoadingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BkashPaymentGetway'
>;

const OnlineCigaretteBuyAndPaymentOnline: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<Item[]>([]);
  const [mqttClient, setMqttClient] = useState<any>(null);
  const navigation = useNavigation<AuthLoadingScreenNavigationProp>();

  const handleToastMsg = (getType: string, getText: string) => {
    Toast.show({
      type: getType,
      text1: getText,
      visibilityTime: 2000,
    });
  };

  const handelGetData = async () => {
    setLoading(true);

    instance
      .get('/GetLastStockQty')
      .then((response: any) => {
        // console.log(
        //   'Transaction Data:',
        //   JSON.stringify(response.data, null, 2),
        // );

        setTimeout(() => {
          const initialData = response.data;
          setData(initialData);
          setLoading(false);
        }, 1000); // 1-second delay
      })
      .catch((error: any) => {
        //setError(`Error fetching data: ${error.message}`);
        setLoading(false);
      });
  };
  const backAction = () => {
    Alert.alert('Online cigarette Buy', 'App No Exit', [
      {
        text: 'NO',
        onPress: () => null,
        style: 'cancel',
      },
    ]);
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      handelGetData();
      SystemNavigationBar.immersive();
      BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', backAction);
      };
    }, []),
  );

  // useEffect(() => {
  //   handelGetData();
  // }, []);

  const incrementQuantity = (Id: number) => {
    setData(prevData => {
      return prevData.map(item => {
        if (item.Id === Id) {
          if (item.CurrentBalance <= item.Count) {
            handleToastMsg(
              'error',
              `Quantity Must Be Less than / Equal to Present Stock`,
            );
            return item;
          }

          if (item.Count >= 3) {
            handleToastMsg('error', `You Can't Buy Up to 3 pcs`);
            return item;
          }
          item.Count = isNaN(item.Count) ? 1 : item.Count + 1;
          setSelectedValue(prevSelected => {
            const existingIndex = prevSelected.findIndex(i => i.Id === Id);
            if (existingIndex >= 0) {
              prevSelected[existingIndex] = {...item};
              return [...prevSelected];
            } else {
              return [...prevSelected, {...item}];
            }
          });
        }
        return item;
      });
    });
  };

  const decrementQuantity = (id: number) => {
    setData(prevData => {
      return prevData.map(item => {
        if (item.Id === id) {
          item.Count = item.Count > 0 ? item.Count - 1 : 0;
          setSelectedValue(prevSelected => {
            const existingIndex = prevSelected.findIndex(i => i.Id === id);
            if (existingIndex >= 0) {
              prevSelected[existingIndex] = {...item};
              return [...prevSelected];
            } else {
              return [...prevSelected, {...item}];
            }
          });
        }
        return item;
      });
    });
  };

  const handleSubmitData = async () => {
    if (!selectedValue || selectedValue.length === 0) {
      handleToastMsg('error', 'Please Select Any Items');
      return;
    }
    const totalAmount = selectedValue.reduce((total, item) => {
      return total + item.Count * item.ItemsRate;
    }, 0);

    // -----------------------Insert Invoice---------------------

    const InvoiceData = {
      InvoiceAmount: totalAmount,
    };

    const response = await instance.post(
      '/InsertInvoiceMaster', // Replace with your server's IP
      InvoiceData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    //console.log('Response:', response.data.id);

    // ----------------------navigation BkashPaymentGetway ----------------------

    navigation.navigate('BkashPaymentGetway', {
      TatalSelectedData: selectedValue,
      TotalAmount: totalAmount,
      InvoiceMasterID: response.data.id,
    });

    resetSelectedValue();
  };

  const resetSelectedValue = () => {
    setData(prevData =>
      prevData.map(item => ({
        ...item,
        Count: 0,
      })),
    );

    setSelectedValue([]);
  };

  const renderItem = ({item}: {item: Item}) => (
    <View style={styles.itemContainer}>
      <View style={{width: '100%', backgroundColor: '#fff'}}>
        <Pressable
          onPress={() => {
            incrementQuantity(item.Id);
          }}>
          <ImageBackground
            source={{
              uri: `http://192.168.1.20:5000/${item.ImageUrl}`,
            }}
            resizeMode="contain"
            style={styles.image}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: '-1.6%',
                backgroundColor: '#E43D30',
                borderRadius: 100,
                borderColor: '#ccc',
                borderWidth: 1,
                borderStartWidth: 0,
                alignSelf: 'flex-end',
                paddingHorizontal: 18,
                paddingVertical: 3,
                borderBottomStartRadius: 6,
                borderTopStartRadius: 6,
              }}>
              <Text style={styles.StockText}>Stock</Text>
              <Text style={styles.CurrentBalancetext}>
                {item.CurrentBalance === null || item.CurrentBalance === 0 ? (
                  <>
                    <Text style={{fontSize: 18}}>out</Text>
                  </>
                ) : (
                  item.CurrentBalance
                )}
              </Text>
            </View>
          </ImageBackground>
        </Pressable>
      </View>

      <Text style={styles.itemName}>{item.ItemNames}</Text>
      <Text style={styles.Item_Rate_Text}>Rate : {item.ItemsRate}</Text>
      <View style={styles.buttonContainer}>
        {item.Count > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              alignContent: 'center',
            }}>
            <IconButton
              icon="minus-thick"
              size={40}
              iconColor="#fff"
              style={styles.incrementButton}
              onPress={() => decrementQuantity(item.Id)}
            />
            <Text style={styles.counterText}>{item.Count}</Text>

            <IconButton
              icon="plus-thick"
              size={40}
              iconColor="#fff"
              style={[
                styles.incrementButton,
                {backgroundColor: item.Count >= 3 ? 'gray' : '#B20093'},
              ]}
              onPress={() => incrementQuantity(item.Id)}
            />
          </View>
        ) : (
          <View style={styles.addbuttonArea}>
            <>
              <Pressable
                style={[
                  styles.AddButton,
                  ,
                  {
                    backgroundColor: item.CurrentBalance > 0 ? 'red' : 'gray',
                  },
                ]}
                onPress={() => {
                  incrementQuantity(item.Id);
                }}>
                <Text style={styles.Addtext}>ADD</Text>
              </Pressable>
            </>
          </View>
        )}
      </View>
    </View>
  );

  // if (loading) {
  //   return <Text style={styles.LoadingText}>Loading...</Text>;
  // }

  if (error) {
    return (
      <Text
        style={{
          marginTop: height / 2.3,
          justifyContent: 'center',
          alignContent: 'center',
          textAlign: 'center',
          color: 'red',
        }}>
        {error}
      </Text>
    );
  }

  return (
    <View style={{flex: 4, paddingHorizontal: 8, marginTop: '5%'}}>
      {/* <StatusBar hidden={true} /> */}
      {/* <StatusBar
        hidden={false}
        backgroundColor={'transparent'}
        translucent={false}
      /> */}

      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <Toast />
      <Spinner
        visible={loading}
        textContent={'Loading...'}
        textStyle={styles.spinnerText}
      />

      <View
        style={{
          flex: 2,
          marginHorizontal: 10,
          // backgroundColor: 'red',
          justifyContent: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={styles.SubmitButton_area}>
            <Pressable
              style={styles.SubmitButton}
              onPress={() => {
                handleSubmitData();
              }}>
              <Text style={styles.text}>Submit</Text>
            </Pressable>
          </View>
          <View style={styles.Reset_area}>
            <Pressable
              style={styles.ResetButton}
              onPress={() => {
                resetSelectedValue();
              }}>
              <Text style={styles.text}>Reset</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#017071',
    //alignItems: 'center',
    margin: 4,
    // height: height / 5,
    width: '49%',
    borderRadius: 1,
    borderColor: '#ccc',
    borderWidth: 0.5,
  },
  image: {
    height: height / 5,
    width: '98%',
    borderRadius: 5,
    //resizeMode: 'stretch',
    margin: 5,
  },

  itemName: {
    color: '#FFFFFF',
    fontSize: width / 21,
    fontWeight: 'bold',
    textAlign: 'center',
    // backgroundColor: 'red',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginTop: 10,
  },
  Item_Rate_Text: {
    fontSize: width / 22,
    marginHorizontal: 10,
    fontFamily: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  Item_Stock_Text: {
    fontSize: width / 30,
    textAlign: 'right',
    fontFamily: 'bold',
    color: '#FFFFFF',
    marginVertical: 10,
    paddingHorizontal: 10,
  },

  incrementButton: {
    backgroundColor: '#612697',
    borderRadius: 5,
    height: height / 22,
    width: width / 10,
  },
  counterText: {
    fontSize: 40,
    marginHorizontal: 10,
    fontFamily: 'bold',
    color: '#FFFFFF',
  },

  AddButton: {
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: 'red',
    width: '100%',
    //height: height / 22,
  },
  addbuttonArea: {
    flex: 1,
    //paddingBottom: 10,
  },
  Addtext: {
    color: '#FFFFFF',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  SubmitButton_area: {
    width: width / 2.2,
    //height: height / 15,
    marginRight: 6,
  },
  SubmitButton: {
    backgroundColor: '#026E75',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  Reset_area: {
    width: width / 2.2,
    //height: height / 15,
  },
  ResetButton: {
    backgroundColor: '#FC4136',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  text: {
    color: '#FFFFFF',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  CurrentBalancetext: {
    color: '#fff',
    fontSize: width / 25,
    fontWeight: 'bold',
    textAlign: 'center',
    // borderColor: '#000000',
    // borderWidth: 1,
  },
  StockText: {
    color: '#fff',
    fontSize: width / 50,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  toggleButton: {
    position: 'absolute',
    top: height / 50,
    left: width / 1.4,
    zIndex: 1,
    color: '#fff',
  },

  scannedText: {
    color: '#02AFAE',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    margin: 5,
    lineHeight: (width / 25) * 1.2,
    letterSpacing: 0.5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  injuriousText: {
    color: '#02AFAE',
    fontSize: width / 25,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    margin: 5,
    lineHeight: (width / 25) * 1.2,
    letterSpacing: 0.5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  timeLeftText: {
    color: '#FF3B30',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: (width / 25) * 1.2,
    letterSpacing: 1,
    backgroundColor: '#f0f0f0',
  },
  LoadingText: {
    color: '#000',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  spinnerText: {
    color: '#FFF',
  },
  //   ConfirmationSendText: {
  //     color: '#000',
  //     fontSize: width / 25,
  //     fontWeight: 'bold',
  //     textAlign: 'center',
  //   },
  Logoutbutton: {
    backgroundColor: '#FC4136',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: width / 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OnlineCigaretteBuyAndPaymentOnline;
