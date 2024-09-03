import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  Pressable,
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
import {useNavigation} from '@react-navigation/native';
import {IconButton} from 'react-native-paper';
import jwtDecode from 'jwt-decode';

interface Item {
  id: number;
  itemCode: string;
  itemDesc: string;
  itemName: string;
  quantity: number;
  salesRate: number;
  localRate: number;
  image: string;
  Count: number;
  CurrentBalance: number;
  driveAddress: number;
}

interface EmpData {
  id: number;
  address: string;
  membertype: number;
  payrollid: string;
  payrollconnectid: string;
  mobilenumber: string;
}

type DecodedToken = {
  userid: string;
  adloginid: string;
  [key: string]: any;
};

const OnlineCigaretteSale: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<Item[]>([]);
  // const [empmembershipdata, setEmpmembershipdata] = useState<EmpData[]>([]);

  const [empmembershipdata, setEmpmembershipdata] = useState<EmpData | null>(
    null,
  );

  const [isOpenCamera, setIsOpenCamera] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back'); // Set initial type as 'back'
  const scanner = useRef<QRCodeScanner>(null);
  const [flashlightEnabled, setFlashlightEnabled] = useState<boolean>(false);
  const [mqttClient, setMqttClient] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const navigation = useNavigation();

  const handleOnRead = (e: any) => {
    if (e.data) {
      setScannedData(e.data);
      setIsOpenCamera(false);
      setTimeLeft(60);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      resetSelectedValue();
    }, 60000);

    return () => clearTimeout(timer);
  }, [scannedData]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(timeLeft => {
        if (timeLeft <= 1) {
          clearInterval(interval);
          resetSelectedValue();
          return 0;
        }
        return timeLeft - 1;
      });
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [timeLeft, scannedData]);

  const handleToastMsg = (getType: string, getText: string) => {
    Toast.show({
      type: getType,
      text1: getText,
      visibilityTime: 2000,
    });
  };

  // const handelgetUserID = async () => {
  //   setLoading(true);
  //   try {
  //     const userID = await AsyncStorage.getItem('getuserID');
  //     console.log('userID: ' + userID);

  //     if (userID !== null) {
  //       instance
  //         .post('/FSM_Transaction/GetMemberShipInformation/0/' + userID)
  //         .then((response: any) => {
  //           console.log(response.data.res);
  //           setEmpmembershipdata(response.data.res);
  //         })
  //         .catch((error: any) => {
  //           setError(`Error fetching data: ${error.message}`);
  //           setLoading(false);
  //         });

  //       // console.log('Retrieved userID:', userID);
  //       // Use userID as needed
  //     } else {
  //       console.log('No userID found in AsyncStorage');
  //     }
  //   } catch (error) {
  //     console.error('Error retrieving userID:', error);
  //   }
  // };

  const handelgetUserID = async () => {
    setLoading(true);
    try {
      const userID = await AsyncStorage.getItem('getuserID');
      const token = await AsyncStorage.getItem('userToken');
      // console.log('userID: ' + userID);
      // console.log('token: ' + token);

      if (userID !== null) {
        const token = 'your_authorization_token_here'; // Replace with your actual token
        instance
          .post(
            '/FSM_Transaction/GetMemberShipInformation/0/' + userID,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          .then((response: any) => {
            // console.log(response.data.res);
            setEmpmembershipdata(response.data.res);
          })
          .catch((error: any) => {
            // setError(`Error fetching data: ${error.message}`);
            console.log(`Error fetching data: ${error.message}`);
            setLoading(false);
          });

        // console.log('Retrieved userID:', userID);
        // Use userID as needed
      } else {
        console.log('No userID found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error retrieving userID:', error);
    }
  };

  const handelGetData = async () => {
    setLoading(true);

    // Define the Authorization token
    const token = await AsyncStorage.getItem('userToken');

    instance
      .get('TransactionOX/GetFSM_Item_With_Stock', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response: any) => {
        // console.log(
        //   'Transaction Data:',
        //   JSON.stringify(response.data, null, 2),
        // );
        setTimeout(() => {
          const initialData = response.data.res.map((item: any) => ({
            ...item,
            Count: 0,
          }));
          setData(initialData);
          setLoading(false);
        }, 1000); // 1-second delay
      })
      .catch((error: any) => {
        //setError(`Error fetching data: ${error.message}`);
        setLoading(false);
      });
  };

  // const handelGetData = () => {
  //   setLoading(true);
  //   instance
  //     .get('TransactionOX/GetFSM_Item_With_Stock')
  //     .then((response: any) => {
  //       console.log(
  //         'Transaction Data:',
  //         JSON.stringify(response.data, null, 2),
  //       );

  //       setTimeout(() => {
  //         const initialData = response.data.res.map((item: any) => ({
  //           ...item,
  //           Count: 0,
  //         }));
  //         setData(initialData);
  //         setLoading(false);
  //       }, 1000); // 2-second delay
  //     })
  //     .catch((error: any) => {
  //       setError(`Error fetching data: ${error.message}`);
  //       setLoading(false);
  //     });
  // };

  // const handelGetData = () => {
  //   setLoading(true);
  //   instance
  //     .get('TransactionOX/GetFSM_Item_With_Stock')
  //     .then((response: any) => {
  //       const initialData = response.data.res.map((item: Item) => ({
  //         ...item,
  //         Count: 0,
  //       }));
  //       setData(initialData);
  //       setLoading(false);
  //     })
  //     .catch((error: any) => {
  //       setError(`Error fetching data: ${error.message}`);
  //       setLoading(false);
  //     });
  // };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
          handleToastMsg('error', 'Token is not available');
          return;
        }

        handelGetData();
        handelgetUserID();
      } catch (error) {
        handleToastMsg('error', 'An error occurred while fetching data');
      }
    };

    fetchData();
  }, []);

  const incrementQuantity = (id: number) => {
    setData(prevData => {
      return prevData.map(item => {
        if (item.id === id) {
          if (item.quantity <= item.Count) {
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
            const existingIndex = prevSelected.findIndex(i => i.id === id);
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
        if (item.id === id) {
          item.Count = item.Count > 0 ? item.Count - 1 : 0;
          setSelectedValue(prevSelected => {
            const existingIndex = prevSelected.findIndex(i => i.id === id);
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
    if (selectedValue.length === 0 || selectedValue.length === undefined) {
      handleToastMsg('error', 'Please Select Any Items');
      return;
    }

    // Check if empmembershipdata is not null
    if (!empmembershipdata) {
      handleToastMsg('error', 'Employee membership data is not available');
      return;
    }

    try {
      // Retrieve token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        handleToastMsg('error', 'Token is not available');
        return;
      }

      // Decode the token
      let decoded: DecodedToken = jwtDecode(token);
      // console.log(
      //   'Check token from ' + JSON.stringify(decoded.userid, null, 2),
      // );
      // console.log(
      //   'Check token from ' + JSON.stringify(decoded.adloginid, null, 2),
      // );

      const empData = empmembershipdata;

      // console.log(
      //   'Checking if empmembershipdata ' +
      //     JSON.stringify(empData.address, null, 2),
      // );

      if (
        !empData.id ||
        !empData.membertype ||
        !empData.payrollid ||
        !empData.address
      ) {
        handleToastMsg('error', 'Incomplete employee membership data');
        return;
      }

      console.log(JSON.stringify(empmembershipdata, null, 2));

      const SaveData = selectedValue.map(item => ({
        id: 0,
        itemId: item.id,
        locationId: 0,
        itemDesc: item.itemDesc,
        quantity: item.Count,
        salesRate: item.salesRate,
        localRate: item.localRate,
        membershipId: empData.id,
        memberType: empData.membertype,
        payrollId: empData.payrollid,
        payrollConnectionId: empData.payrollconnectid || null,
        mobileNumber: empData.mobilenumber,
        address: empData.address,
        invoiceNumber: 'string',
        driveAddress: item.driveAddress || null,
        userid: decoded.userid,
        adloginid: decoded.adloginid,
      }));

      console.log('Save data ' + JSON.stringify(SaveData, null, 2));

      setLoading(true);

      // Make the API request with the Bearer token
      const response = await instance.post(
        'TransactionOX/AddOXTransaction',
        SaveData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(
        'response.data.res ' + JSON.stringify(response.data, null, 2),
      );

      const deviceData = response.data.res.map((itemFordevice: any) => ({
        itemId: itemFordevice.itemId,
        quantity: itemFordevice.quantity,
        salesRate: itemFordevice.salesRate,
        driveAddress: itemFordevice.driveAddress || null,
      }));

      //  console.log('deviceData received' + JSON.stringify(deviceData, null, 2));

      saveIncrementedItems(deviceData);

      handelGetData();
      setLoading(false);
    } catch (error) {
      console.log('Error fetching data');
      setLoading(false);
    }
  };

  // const handleSubmitData = async () => {
  //   if (selectedValue.length === 0 || selectedValue.length === undefined) {
  //     handleToastMsg('error', 'Please Select Any Items');
  //     return;
  //   }

  //   // Check if empmembershipdata is not null
  //   if (!empmembershipdata) {
  //     handleToastMsg('error', 'Employee membership data is not available');
  //     return;
  //   }

  //   // Now empmembershipdata is guaranteed to be an EmpData object
  //   const empData = empmembershipdata;

  //   console.log(
  //     'Checking if empmembershipdata ' +
  //       JSON.stringify(empData.address, null, 2),
  //   );

  //   // Check if empData has the required properties
  //   if (
  //     !empData.id ||
  //     !empData.membertype ||
  //     !empData.payrollid ||
  //     !empData.address
  //   ) {
  //     handleToastMsg('error', 'Incomplete employee membership data');
  //     return;
  //   }

  //   console.log(JSON.stringify(empmembershipdata, null, 2));

  //   // const SaveData = selectedValue.map(item => ({
  //   //   id: 0,
  //   //   itemId: item.id,
  //   //   locationId: 0,
  //   //   itemDesc: item.itemDesc,
  //   //   quantity: item.Count,
  //   //   salesRate: item.salesRate,
  //   //   localRate: item.localRate,
  //   //   membershipId: empData.id,
  //   //   memberType: empData.membertype,
  //   //   payrollId: empData.payrollid,
  //   //   payrollConnectionId: empData.payrollconnectid || null,
  //   //   mobileNumber: empData.mobilenumber,
  //   //   address: empData.address,
  //   //   driveAddress: item.driveAddress || null,
  //   // }));

  //   const SaveData = selectedValue.map(item => ({
  //     id: 0,
  //     itemId: 0,
  //     locationId: 0,
  //     itemDesc: 'string',
  //     quantity: 1,
  //     salesRate: 0,
  //     localRate: 0,
  //     membershipId: 0,
  //     memberType: 0,
  //     payrollId: 0,
  //     payrollConnectionId: 0,
  //     mobileNumber: 'string',
  //     address: 'string',
  //     invoiceNumber: 'string',
  //     driveAddress: 'string',
  //     userid: 0,
  //     adloginid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  //   }));

  //   console.log('Save data ' + JSON.stringify(SaveData, null, 2));

  //   try {
  //     setLoading(true);
  //     const response = await instance.post(
  //       'TransactionOX/AddOXTransaction',
  //       SaveData,
  //     );

  //     console.log(
  //       'response.data.res ' + JSON.stringify(response.data, null, 2),
  //     );

  //     const deviceData = response.data.res.map((itemFordevice: any) => ({
  //       itemId: itemFordevice.itemId,
  //       quantity: itemFordevice.quantity,
  //       salesRate: itemFordevice.salesRate,
  //       driveAddress: itemFordevice.driveAddress || null,
  //     }));

  //     console.log('deviceData received' + JSON.stringify(deviceData, null, 2));

  //     saveIncrementedItems(deviceData);

  //     handelGetData();
  //     setLoading(false);
  //   } catch (error) {
  //     setError('Error fetching data');
  //     setLoading(false);
  //   }
  // };

  const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));

  const saveIncrementedItems = async (deviceData: any) => {
    if (!mqttClient) {
      handleToastMsg('error', 'Network not initialized.');
      return;
    }
    if (selectedValue.length === 0 || selectedValue.length === undefined) {
      handleToastMsg('error', 'Please Select Any Items');
      return;
    }
    if (deviceData.quantity === 0) {
      handleToastMsg('error', 'stock is not available');
      return;
    }

    // console.log(
    //   'selectedValue ' + JSON.stringify(deviceData.quantity, null, 2),
    // );

    // const itemsToSave = deviceData.filter((item: any) => item.quantity > 0);
    const itemsToSave = (deviceData || []).filter(
      (item: any) => item.quantity > 0,
    );

    // console.log('Items to save:', itemsToSave);

    const delayTime = 1000;
    let totalPrice = 0;
    let totalQuantity = 0;

    try {
      for (const item of itemsToSave) {
        totalPrice += item.salesRate * item.quantity;
        totalQuantity += item.quantity;

        const formattedMessage = JSON.stringify({
          drive: item.driveAddress,
          count: item.quantity,
        });

        if (mqttClient) {
          mqttClient.publish(
            'cigarate/received/device123',
            formattedMessage,
            0,
            false,
          );
        } else {
          console.error('MQTT client is not initialized');
        }

        await delay(delayTime);
      }

      //   console.log(
      //     `Total Price: ${totalPrice.toFixed(
      //       2,
      //     )}, Total Quantity: ${totalQuantity}`,
      //   );
      Alert.alert(
        'Success',
        `Total Price: ৳${totalPrice.toFixed(
          2,
        )}, Total Quantity: ${totalQuantity}`,
      );

      // Reset item.Count to 0 for all items
      resetSelectedValue();
    } catch (err) {
      console.error('Failed to publish message:', err);
    }
  };

  const resetSelectedValue = () => {
    setData(prevData =>
      prevData.map(item => ({
        ...item,
        Count: 0,
      })),
    );

    setSelectedValue([]);
    setScannedData('');
    setTimeLeft(60);
    setScannedData('');
  };

  const handelScannFrist = () => {
    handleToastMsg('error', `Scan Frist `);
  };

  useEffect(() => {
    const randomNumber = String(
      Math.floor(Math.random() * 100000000000),
    ).padStart(11, '0');
    // //console.log(randomNumber);
    // console.log(randomNumber);

    if (!mqttClient) {
      MQTT.createClient({
        uri: 'mqtt://172.16.16.4:1883',
        clientId: randomNumber,
        //clientId: '12345678910',
      })
        .then(client => {
          setMqttClient(client); // Use state setter to store the client
          client.on('closed', () => console.log('mqtt.event.closed'));
          client.on('error', msg => console.log('mqtt.event.error', msg));
          client.on('message', msg => {
            console.log('mqtt.event.message', msg);
            // const DeliveryStatusJson = JSON.parse(msg.data);
            // // console.log('cigaratePassCount:', DeliveryStatusJson);
            // setDeliveryStatus(DeliveryStatusJson);
            // //Alert.alert(msg.data);
            // // Handle received message here
            // setLoading(false);
          });

          client.on('connect', () => {
            console.log('connected');
            client.subscribe('cigarate/confirmation/device123', 0);
          });

          client.connect();
        })
        .catch(err => console.log(err));

      // Cleanup function
      return () => {
        if (mqttClient) {
          mqttClient.disconnect();
          setMqttClient(null);
          setLoading(false);
        }
      };
    }
  }, []);

  // Define handleLogout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userDetails');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  const renderItem = ({item}: {item: Item}) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.itemName}</Text>
      <Text style={styles.Item_Rate_Text}>Rate : {item.salesRate}</Text>
      <View style={styles.buttonContainer}>
        {item.Count > 0 ? (
          <View style={{flexDirection: 'row'}}>
            <Pressable
              style={styles.DecrementButton}
              onPress={() => decrementQuantity(item.id)}>
              <Text style={styles.decrementtext}>-</Text>
            </Pressable>
            <Text style={styles.counterText}>{item.Count}</Text>
            <Pressable
              style={[
                styles.incrementButton,
                {backgroundColor: item.Count >= 3 ? 'gray' : '#612697'},
              ]}
              onPress={() => incrementQuantity(item.id)}>
              <Text style={styles.incrementtext}>+</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.addbuttonArea}>
            {scannedData === 'injurious to health  .' ? (
              <>
                <Pressable
                  style={styles.AddButton}
                  onPress={() => {
                    incrementQuantity(item.id);
                  }}>
                  <Text style={styles.Addtext}>ADD</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={styles.AddButton}
                  onPress={() => {
                    handelScannFrist();
                  }}>
                  <Text style={styles.Addtext}>ADD</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </View>

      <Text style={styles.Item_Stock_Text}>Stock: {item.quantity}</Text>
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
    <View style={{flex: 1}}>
      {isOpenCamera ? (
        <>
          <QRCodeScanner
            cameraStyle={{
              height: height,
              width: width,
              alignSelf: 'center',
              justifyContent: 'center',
            }}
            onRead={data => {
              handleOnRead(data);
              // GetBarCodeDataByLavelWise(data);
            }}
            flashMode={
              !flashlightEnabled
                ? RNCamera.Constants.FlashMode.off
                : RNCamera.Constants.FlashMode.torch
            }
            reactivate={true}
            reactivateTimeout={3000}
            showMarker={true}
            cameraType={cameraType}
            ref={scanner}
          />

          <IconButton
            icon="close-circle"
            size={40}
            style={styles.toggleButton}
            iconColor="#FF0000"
            onPress={() => setIsOpenCamera(prev => !prev)}
          />
        </>
      ) : (
        <>
          <View
            style={{
              flex: 1,
              marginHorizontal: 10,
              justifyContent: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View style={{width: '70%', alignSelf: 'center'}}>
                {scannedData === 'injurious to health  .' ? (
                  <View style={{}}>
                    <Text style={styles.timeLeftText}> 00 : {timeLeft} s</Text>
                    <Text style={styles.injuriousText}>
                      All brands of cigarette injurious to health,can lead to
                      heart attacks:Doctors
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.scannedText}>Please Scan Frist</Text>
                  </>
                )}
              </View>
              <View
                style={{
                  width: '30%',
                  // alignItems: 'center',
                  // justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <IconButton
                  icon="barcode-scan"
                  size={50}
                  iconColor="#227EAC"
                  onPress={() => {
                    setIsOpenCamera(!isOpenCamera);
                  }}
                />
              </View>
            </View>
          </View>
          <Toast />
          <View style={{flex: 3, marginHorizontal: 10}}>
            <FlatList
              data={data}
              numColumns={2}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
            />

            <Spinner
              visible={loading}
              textContent={'Loading...'}
              textStyle={styles.spinnerText}
            />
            {/* {deliverystatus?.cigaratePassCount && (
              <View style={{height: height / 15}}>
                <Text style={styles.ConfirmationSendText}>
                  Send Cigarette Qty {deliverystatus?.cigaratePassCount}
                </Text>
              </View>
            )} */}
          </View>
          <View style={{flex: 1, marginHorizontal: 10}}>
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#017071',
    //alignItems: 'center',
    margin: 5,
    // height: height / 5,
    width: '48%',
    borderRadius: 5,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
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
  CountText: {
    fontSize: width / 20,
    marginHorizontal: 10,
    fontFamily: 'bold',
    color: '#FFFFFF',
  },
  Addtext: {
    color: '#FFFFFF',
    fontSize: width / 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  DecrementButton: {
    backgroundColor: '#B20093',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
    height: height / 22,
    width: width / 10,
  },
  incrementButton: {
    backgroundColor: '#612697',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
    height: height / 22,
    width: width / 10,
  },
  counterText: {
    fontSize: width / 15,
    marginHorizontal: 10,
    fontFamily: 'bold',
    color: '#FFFFFF',
  },
  incrementtext: {
    fontSize: width / 15,
    color: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decrementtext: {
    fontSize: width / 15,
    color: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  AddButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    width: '100%',
    height: height / 22,
  },
  addbuttonArea: {
    flex: 1,
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

export default OnlineCigaretteSale;
