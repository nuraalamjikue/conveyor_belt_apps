


// import React, { useEffect, useState } from 'react';
// import { View, Dimensions, StyleSheet, Pressable, Text } from 'react-native';
// import MQTT from 'sp-react-native-mqtt';
// import Spinner from 'react-native-loading-spinner-overlay';
// const { height, width } = Dimensions.get('window');
// import Toast from 'react-native-toast-message';
// import { Button } from 'react-native-paper';
// import QRCodeScanner from 'react-native-qrcode-scanner';
// import { RNCamera } from 'react-native-camera';
// let mqttClient;

// // const RateData = [
// //     { Id: 1, BrandName: 'Rate', Rate: 10, StockQty: 5 },
// //     { Id: 2, BrandName: 'Rate', Rate: 20.5, StockQty: 3 },
// //     { Id: 3, BrandName: 'Rate', Rate: 18.5, StockQty: 7 },
// //     { Id: 4, BrandName: 'Rate', Rate: 18.5, StockQty: 4 },
// //     { Id: 5, BrandName: 'Rate', Rate: 18.5, StockQty: 6 }
// // ];


// const SmockingScreen = () => {
//     const [loading, setLoading] = useState(false);
//     const [clickedButtonIndex, setClickedButtonIndex] = useState([]);
//     const [counters, setCounters] = useState([0, 0, 0, 0]);
//     // const [price, setPrice] = useState(RateData);
//     const [deliverystatus, setDeliveryStatus] = useState([]);
//     const [Itemdata, setItemData] = useState(null);

//     // ----------------------------------------------

//     const [isOpenCamera, setIsOpenCamera] = useState(false);
//     const [scannedData, setScannedData] = useState('');
//     const [cameraType, setcameraType] = useState('front');
//     const [flashlightEnabled, setFlashlightEnabled] = useState(false);

//     const handleOnRead = e => {
//         if (e.data) {
//             setScannedData(e.data);
//             setIsOpenCamera(false);
//         }
//     };



//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await fetch('http://192.168.15.5:98/api/TransactionOX/GetFSM_Item_With_Stock');
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 const result = await response.json();
//                 setItemData(result);
//                 console.log('Transaction returned' + JSON.stringify(result, null, 2));

//             } catch (error) {
//                 setError(error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     const handleToastMsg = (getType, getText) => {
//         Toast.show({
//             type: getType,
//             text1: getText,
//             visibilityTime: 2000,
//         });
//     };



//     const handleButtonClick = (index) => {
//         setClickedButtonIndex(prevIndices => {
//             const newIndices = [...prevIndices];
//             if (!newIndices.includes(index)) {
//                 newIndices.push(index);
//             }
//             return newIndices;
//         });
//     };

//     const resetButtons = () => {
//         setClickedButtonIndex([]);
//         setCounters([0, 0, 0, 0]); // Reset all counters
//     };

//     // const incrementCounter = (index) => {
//     //     setCounters(prevCounters => {
//     //         const newCounters = [...prevCounters];
//     //         newCounters[index] += 1;
//     //         return newCounters;
//     //     });
//     // };

//     // const incrementCounter = (index) => {
//     //     setCounters(prevCounters => {
//     //         const newCounters = [...prevCounters];
//     //         if (newCounters[index] < 3) {
//     //             newCounters[index] += 1;
//     //         }
//     //         return newCounters;
//     //     });
//     // };

//     const incrementCounter = (index) => {
//         setCounters(prevCounters => {
//             const newCounters = [...prevCounters];
//             if (newCounters[index] < 3) {
//                 if (newCounters[index] < 1) {
//                     handleButtonClick(index);
//                 }
//                 newCounters[index] += 1;
//             }
//             return newCounters;
//         });
//     };

//     // const decrementCounter = (index) => {
//     //     setCounters(prevCounters => {
//     //         const newCounters = [...prevCounters];
//     //         newCounters[index] = Math.max(newCounters[index] - 1, 0); // Prevent negative counts
//     //         return newCounters;
//     //     });
//     // };

//     const decrementCounter = (index) => {
//         setCounters(prevCounters => {
//             const newCounters = [...prevCounters];
//             newCounters[index] = Math.max(newCounters[index] - 1, 0);
//             if (newCounters[index] < 1) {
//                 console.log('decrementCounter ' + newCounters);
//                 resetButtons();
//             }
//             return newCounters;
//         });
//     };
//     const handelEmpty = () => {
//         console.log('test handel empty');

//         handleToastMsg('error', `Please select Brand `);
//         return;
//     };


//     const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//     const sendMessage = async () => {
//         if (!mqttClient) {
//             console.warn('MQTT client not initialized.');
//             return;
//         }

//         const delayTime = 1000; // Delay in milliseconds
//         let totalPrice = 0;
//         let totalQuantity = 0;

//         try {
//             for (const index of clickedButtonIndex) {
//                 // Calculate total price and total quantity
//                 // totalPrice += price[index].Rate * counters[index];
//                 // totalQuantity += counters[index];


//                 totalPrice = Itemdata?.res[index].salesRate * counters[index];
//                 totalStockQty = Itemdata?.res[index].quantity;
//                 totalQuantity = counters[index];

//                 console.log(`Total Price: ${totalPrice.toFixed(2)}, Total Quantity: ${totalQuantity}, Total Stock: ${totalStockQty}`);

//                 const formattedMessage = `{"drive": ${index + 1},"count": ${counters[index]}}`;

//                 // Publish the message
//                 mqttClient.publish('cigarate/received/device123', formattedMessage, 0, false);
//                 // console.log(`Message published for index: ${index}`);

//                 // Wait for the specified delay
//                 await delay(delayTime);
//             }

//             // Log or handle the total price and total quantity
//             // console.log(`Total Price: ${totalPrice.toFixed(2)}, Total Quantity: ${totalQuantity}`);

//             // Optionally, show a toast message with the totals
//             handleToastMsg('success', `Total Price: $${totalPrice.toFixed(2)}, Total Quantity: ${totalQuantity}`);

//             // Reset buttons and counters
//             resetButtons();
//         } catch (err) {
//             console.error('Failed to publish message:', err);
//         }
//     };



//     // const sendMessage = async () => {
//     //     if (!mqttClient) {
//     //         console.warn('MQTT client not initialized.');
//     //         return;
//     //     }

//     //     const indices = [0, 1];
//     //     const delayTime = 1000; // Delay in milliseconds (e.g., 1000ms = 1 second)

//     //     try {
//     //         for (const index of clickedButtonIndex) {
//     //             console.log(`Preparing to send message for index: ${index}`);

//     //             const formattedMessage = `{"drive": ${index + 1},"count": ${counters[index]}}`;

//     //             // Publish the message
//     //             mqttClient.publish('cigarate/received/device123', formattedMessage, 0, false);
//     //             console.log(`Message published for index: ${index}`);

//     //             // Wait for the specified delay
//     //             await delay(delayTime);

//     //             //resetButtons();
//     //         }
//     //     } catch (err) {
//     //         console.error('Failed to publish message:', err);
//     //     }
//     // };



//     // useEffect(() => {
//     //     if (!mqttClient) {
//     //         MQTT.createClient({
//     //             uri: 'mqtt://172.16.16.4:1883',
//     //             clientId: '12345678910',
//     //         })
//     //             .then((client) => {
//     //                 mqttClient = client;
//     //                 client.on('closed', () => console.log('mqtt.event.closed'));
//     //                 client.on('error', (msg) => console.log('mqtt.event.error', msg));
//     //                 client.on('message', (msg) => {

//     //                     console.log('Received message:', JSON.parse(msg.data));

//     //                     const DeliveryStatusJson = JSON.parse(msg.data);
//     //                     setDeliveryStatus(DeliveryStatusJson);
//     //                     setLoading(false);
//     //                 });

//     //                 client.on('connect', () => {
//     //                     console.log('Connected to MQTT broker');
//     //                     client.subscribe('cigarate/received/device123', 0);
//     //                 });

//     //                 client.connect();
//     //             })
//     //             .catch((err) => console.log(err));

//     //         return () => {
//     //             if (mqttClient) {
//     //                 mqttClient.disconnect();
//     //                 mqttClient = null;
//     //                 setLoading(false);
//     //             }
//     //         };
//     //     }
//     // }, []);


//     // const sendMessage = () => {
//     //     if (!mqttClient) {
//     //         console.warn('MQTT client not initialized.');
//     //         return;
//     //     }
//     //     try {

//     //         if (clickedButtonIndex === 0) {


//     //             const formattedMessage = `{"drive": ${clickedButtonIndex + 1},"count": ${counters[0]}}`;
//     //             mqttClient.publish('cigarate/received/device123', formattedMessage, 0, false);
//     //             resetButtons();

//     //         } else if (clickedButtonIndex === 1) {
//     //             const formattedMessage = `{"drive": ${clickedButtonIndex + 1},"count": ${counters[1]}}`;
//     //             mqttClient.publish('cigarate/received/device123', formattedMessage, 0, false);
//     //             resetButtons();

//     //         } else if (clickedButtonIndex === 2) {
//     //             const formattedMessage = `{"drive": ${clickedButtonIndex + 1},"count": ${counters[2]}}`;
//     //             mqttClient.publish('cigarate/received/device123', formattedMessage, 0, false);
//     //             resetButtons();

//     //         } else if (clickedButtonIndex === 3) {
//     //             const formattedMessage = `{"drive": ${clickedButtonIndex + 1},"count": ${counters[3]}}`;
//     //             mqttClient.publish('cigarate/received/device123', formattedMessage, 0, false);
//     //             resetButtons();

//     //         }





//     //     } catch (err) {
//     //         console.error('Failed to publish message:', err);
//     //     }
//     // };

//     // const sendMessage = () => {
//     //     if (!mqttClient) {
//     //         console.warn('MQTT client not initialized.');
//     //         return;
//     //     }
//     //     try {
//     //         if (clickedButtonIndex !== null) {
//     //             const formattedMessage = `{"drive": ${clickedButtonIndex + 1},"count": ${counters[clickedButtonIndex]}}`;
//     //             mqttClient.publish('cigarate/received/device123', formattedMessage, 0, false);
//     //             // resetButtons();
//     //         }
//     //     } catch (err) {
//     //         console.error('Failed to publish message:', err);
//     //     }
//     // };





//     useEffect(() => {
//         //  setLoading(true);
//         // Initialize MQTT client if not already initialized
//         if (!mqttClient) {
//             MQTT.createClient({
//                 uri: 'mqtt://172.16.16.4:1883',
//                 clientId: '12345678910',
//             })
//                 .then((client) => {
//                     mqttClient = client;
//                     client.on('closed', () => console.log('mqtt.event.closed'));
//                     client.on('error', (msg) =>
//                         console.log('mqtt.event.error', msg),
//                     );
//                     client.on('message', (msg) => {
//                         console.log('mqtt.event.message', msg);
//                         const DeliveryStatusJson = JSON.parse(msg.data);
//                         // console.log('cigaratePassCount:', DeliveryStatusJson);
//                         setDeliveryStatus(DeliveryStatusJson)
//                         //Alert.alert(msg.data);
//                         // Handle received message here
//                         setLoading(false);
//                     });

//                     client.on('connect', () => {
//                         console.log('connected');
//                         client.subscribe('cigarate/confirmation/device123', 0);



//                     });

//                     client.connect();
//                 })
//                 .catch((err) => console.log(err));

//             // Cleanup function
//             return () => {
//                 if (mqttClient) {
//                     mqttClient.disconnect();
//                     mqttClient = null;
//                     setLoading(false);
//                 }
//             };
//         }
//     }, []);

//     // console.log('deliverystatus received' + deliverystatus);


//     return (
//         <View style={styles.container}>

//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: height / 8, backgroundColor: 'red' }}>
//                 <View>
//                     <Text style={styles.title}>dsffdsgfdgfdg</Text>
//                 </View>
//                 <View>
//                     <Button icon="barcode-scan">

//                     </Button>
//                 </View>





//                 <View>


//                     <Text>{scannedData}</Text>

//                     <View style={{ flexDirection: 'row', marginLeft: 5 }}>
//                         <View style={{ width: '30%' }}>
//                             <Button
//                                 //icon="barcode-scan"
//                                 mode="text"
//                                 style={{
//                                     backgroundColor: '#1566E0',
//                                     borderRadius: 8,
//                                     marginTop: 50,
//                                     marginBottom: 10,

//                                     width: '100%',
//                                 }}
//                                 labelStyle={{ color: '#fff' }}
//                                 onPress={() => {
//                                     {
//                                         console.log('hi' + cameraType);
//                                         cameraType == 'front'
//                                             ? setcameraType('back')
//                                             : setcameraType('front');
//                                     }

//                                     //setTableData([]);
//                                 }}>
//                                 {cameraType == 'front' ? <Text>Front </Text> : <Text>Back </Text>}
//                             </Button>
//                         </View>
//                         <View style={{ width: '30%' }}>
//                             <Button
//                                 icon="barcode-scan"
//                                 mode="text"
//                                 style={{
//                                     backgroundColor: '#1566E0',
//                                     borderRadius: 8,
//                                     marginTop: 50,
//                                     marginBottom: 10,
//                                     marginLeft: 20,
//                                     width: '100%',
//                                 }}
//                                 labelStyle={{ color: '#fff' }}
//                                 onPress={() => {
//                                     setIsOpenCamera(!isOpenCamera);
//                                     //setTableData([]);
//                                 }}>
//                                 {!isOpenCamera ? (
//                                     <Text>Scanner </Text>
//                                 ) : (
//                                     <Text>Scanner Off </Text>
//                                 )}
//                             </Button>
//                         </View>

//                         <View style={{ width: '25%' }}>
//                             {!isOpenCamera ? null : (
//                                 <Button
//                                     icon="lightbulb-on-outline"
//                                     mode="text"
//                                     style={{
//                                         backgroundColor: '#1566E0',
//                                         borderRadius: 8,
//                                         marginTop: 50,
//                                         marginLeft: 35,
//                                         width: '100%',
//                                     }}
//                                     labelStyle={{ color: '#fff' }}
//                                     onPress={() => {
//                                         setFlashlightEnabled(!flashlightEnabled);
//                                     }}>
//                                     {!flashlightEnabled ? (
//                                         <Text>Light Off </Text>
//                                     ) : (
//                                         <Text>Light on </Text>
//                                     )}
//                                 </Button>
//                             )}
//                         </View>
//                     </View>
//                 </View>



//             </View>








//             {isOpenCamera ? (
//                 <>
//                     <QRCodeScanner
//                         cameraStyle={{
//                             height: height,
//                             width: width,
//                             alignSelf: 'center',
//                             justifyContent: 'center',
//                         }}
//                         onRead={data => {
//                             handleOnRead(data);
//                             // GetBarCodeDataByLavelWise(data);
//                         }}
//                         flashMode={
//                             !flashlightEnabled
//                                 ? RNCamera.Constants.FlashMode.off
//                                 : RNCamera.Constants.FlashMode.torch
//                         }
//                         reactivate={true}
//                         reactivateTimeout={3000}
//                         showMarker={true}
//                         cameraType={cameraType}
//                         ref={node => {
//                             scanner = node;
//                         }}
//                     />
//                 </>
//             ) : (
//                 <>

//                     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                         <View style={[
//                             styles.button,
//                             clickedButtonIndex === 0 && styles.clickedButton
//                         ]}>
//                             <View>
//                                 <Text style={styles.text}>
//                                     {Itemdata && Itemdata?.res[0]?.itemName}
//                                 </Text>
//                             </View>
//                             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                                 <Text style={styles.Item_Rate_Text}> Price : {Itemdata && Itemdata?.res[0]?.salesRate}</Text>
//                             </View>

//                             {counters[0] === 0 && (
//                                 <View style={styles.centeredView}>
//                                     <Pressable
//                                         // style={{ width: '100%', height: '100%', }}
//                                         onPress={() => { handleButtonClick(0); incrementCounter(0) }}
//                                     // disabled={clickedButtonIndex !== null && clickedButtonIndex !== 0}
//                                     >
//                                         <Text style={styles.Addtext}>ADD</Text>
//                                     </Pressable>
//                                 </View>
//                             )}

//                             {counters[0] > 0 && (
//                                 <View style={styles.counterContainer}>
//                                     <Pressable
//                                         style={styles.DecrementButton}
//                                         onPress={() => decrementCounter(0)}
//                                     >
//                                         <Text style={styles.decrementtext}>-</Text>
//                                     </Pressable>
//                                     <Text style={styles.counterText}>{counters[0]}</Text>
//                                     <Pressable
//                                         style={styles.incrementButton}
//                                         onPress={() => incrementCounter(0)}
//                                     >
//                                         <Text style={styles.incrementtext}>+</Text>
//                                     </Pressable>
//                                 </View>
//                             )}

//                             <View style={{}}>
//                                 <Text style={styles.Item_stoct_Text}> Stock : {Itemdata && Itemdata?.res[0]?.quantity}</Text>
//                             </View>


//                         </View>

//                         <View style={[
//                             styles.button,
//                             clickedButtonIndex === 1 && styles.clickedButton
//                         ]}>
//                             <View>
//                                 <Text style={styles.text}>
//                                     {Itemdata && Itemdata?.res[1]?.itemName}
//                                 </Text>
//                             </View>
//                             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                                 <Text style={styles.Item_Rate_Text}> Price : {Itemdata && Itemdata?.res[0]?.salesRate}</Text>
//                             </View>
//                             {counters[1] === 0 && (
//                                 <View style={styles.centeredView}>
//                                     <Pressable
//                                         onPress={() => { handleButtonClick(1); incrementCounter(1) }}
//                                     //disabled={clickedButtonIndex !== null && clickedButtonIndex !== 1}
//                                     >
//                                         <Text style={styles.Addtext}>ADD</Text>
//                                     </Pressable>
//                                 </View>
//                             )}

//                             {counters[1] > 0 && (
//                                 <View style={styles.counterContainer}>
//                                     <Pressable
//                                         style={styles.DecrementButton}
//                                         onPress={() => decrementCounter(1)}
//                                     >
//                                         <Text style={styles.decrementtext}>-</Text>
//                                     </Pressable>
//                                     <Text style={styles.counterText}>{counters[1]}</Text>
//                                     <Pressable
//                                         style={styles.incrementButton}
//                                         onPress={() => incrementCounter(1)}
//                                     >
//                                         <Text style={styles.incrementtext}>+</Text>
//                                     </Pressable>
//                                 </View>
//                             )}
//                             <View style={{}}>
//                                 <Text style={styles.Item_stoct_Text}> Stock : {Itemdata && Itemdata?.res[0]?.quantity}</Text>
//                             </View>
//                         </View>
//                     </View>
//                     <Toast />
//                     {/* ------------------------------------secount step 2-------------------------------- */}
//                     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                         <View style={[
//                             styles.button,
//                             clickedButtonIndex === 2 && styles.clickedButton
//                         ]}>
//                             <View>
//                                 <Text style={styles.text}>
//                                     {Itemdata && Itemdata?.res[2]?.itemName}
//                                 </Text>
//                             </View>
//                             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                                 <Text style={styles.Item_Rate_Text}> Price : {Itemdata && Itemdata?.res[0]?.salesRate}</Text>
//                             </View>
//                             {counters[2] === 0 && (
//                                 <View style={styles.centeredView}>
//                                     <Pressable
//                                         onPress={() => { handleButtonClick(2); incrementCounter(2) }}
//                                     // disabled={clickedButtonIndex !== null && clickedButtonIndex !== 2}
//                                     >
//                                         <Text style={styles.Addtext}>ADD</Text>
//                                     </Pressable>
//                                 </View>
//                             )}

//                             {counters[2] > 0 && (
//                                 <View style={styles.counterContainer}>
//                                     <Pressable
//                                         style={styles.DecrementButton}
//                                         onPress={() => decrementCounter(2)}
//                                     >
//                                         <Text style={styles.decrementtext}>-</Text>
//                                     </Pressable>
//                                     <Text style={styles.counterText}>{counters[2]}</Text>
//                                     <Pressable
//                                         style={styles.incrementButton}
//                                         onPress={() => incrementCounter(2)}
//                                     >
//                                         <Text style={styles.incrementtext}>+</Text>
//                                     </Pressable>
//                                 </View>
//                             )}
//                             <View style={{}}>
//                                 <Text style={styles.Item_stoct_Text}> Stock : {Itemdata && Itemdata?.res[0]?.quantity}</Text>
//                             </View>
//                         </View>

//                         <View style={[
//                             styles.button,
//                             clickedButtonIndex === 3 && styles.clickedButton
//                         ]}>
//                             <View>
//                                 <Text style={styles.text}>
//                                     Coming soon
//                                 </Text>
//                             </View>
//                             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                                 <Text style={styles.Item_Rate_Text}> Price : 0</Text>
//                             </View>
//                             {counters[3] === 0 && (
//                                 <View style={styles.centeredViewComingSoon}>
//                                     <Pressable
//                                         onPress={() => { handleButtonClick(2); incrementCounter(2) }}
//                                         disabled={clickedButtonIndex !== null && clickedButtonIndex !== 20}
//                                     >
//                                         <Text style={styles.Addtext1}>ADD</Text>
//                                     </Pressable>
//                                 </View>
//                             )}

//                             {counters[3] > 0 && (
//                                 <View style={styles.counterContainer}>
//                                     <Pressable
//                                         style={styles.DecrementButton}
//                                         onPress={() => decrementCounter(3)}
//                                     >
//                                         <Text style={styles.decrementtext}>-</Text>
//                                     </Pressable>
//                                     <Text style={styles.counterText}>{counters[3]}</Text>
//                                     <Pressable
//                                         style={styles.incrementButton}
//                                         onPress={() => incrementCounter(3)}
//                                     >
//                                         <Text style={styles.incrementtext}>+</Text>
//                                     </Pressable>
//                                 </View>
//                             )}
//                         </View>
//                     </View>
//                     <View style={styles.DeliverystatusArea}>
//                         <Text style={styles.DeliverystatusText}>{deliverystatus.cigaratePassCount}</Text>
//                     </View>

//                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: height / 12 }}>

//                         <View style={styles.SubmitButton_area}>
//                             <Pressable
//                                 style={styles.SubmitButton}
//                                 onPress={
//                                     () => {
//                                         clickedButtonIndex === null ? handelEmpty() : sendMessage();


//                                     }
//                                 }
//                             >
//                                 <Text style={styles.text}>Submit</Text>
//                             </Pressable>
//                         </View>
//                         <View style={styles.Reset_area}>

//                             <Pressable
//                                 style={styles.ResetButton}
//                                 onPress={resetButtons}
//                             >
//                                 <Text style={styles.text}>Reset</Text>
//                             </Pressable>
//                         </View>


//                     </View>

//                 </>
//             )}




//             <Spinner
//                 visible={loading}
//                 textContent={'Loading...'}
//                 textStyle={styles.spinnerText}
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         // justifyContent: 'center',
//         // alignItems: 'center',
//         paddingHorizontal: width / 40,
//         //backgroundColor: 'green',
//     },
//     button: {
//         backgroundColor: '#017071',
//         borderRadius: 5,
//         alignItems: 'center',
//         // justifyContent: 'center',
//         margin: 3,
//         height: height / 5,
//         width: '48%',
//     },
//     clickedButton: {
//         backgroundColor: '#FF5722',
//     },
//     resetButton: {
//         backgroundColor: '#4CAF50',
//         borderRadius: 5,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginTop: 20,
//         height: '10%',
//         width: '48%',
//     },
//     text: {
//         color: '#FFFFFF',
//         fontSize: width / 20,
//         fontWeight: 'bold',
//         textAlign: 'center',
//     },
//     Addtext: {
//         color: '#FFFFFF',
//         fontSize: width / 18,
//         fontWeight: 'bold',

//         textAlign: 'center',
//     },
//     Addtext1: {
//         color: '#02AFAE',
//         fontSize: width / 18,
//         fontWeight: 'bold',

//         textAlign: 'center',
//     },
//     incrementtext: {
//         fontSize: width / 15,
//         color: '#FFFFFF',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     decrementtext: {
//         fontSize: width / 15,
//         color: '#FFFFFF',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     DecrementButton: {
//         backgroundColor: '#B20093',
//         borderRadius: 5,
//         alignItems: 'center',
//         justifyContent: 'center',
//         margin: 3,
//         height: height / 22,
//         width: width / 10,
//     },
//     incrementButton: {
//         backgroundColor: '#612697',
//         borderRadius: 5,
//         alignItems: 'center',
//         justifyContent: 'center',
//         margin: 3,
//         height: height / 22,
//         width: width / 10,
//     },
//     incrementDecrementButton: {
//         backgroundColor: '#E43C30',
//         borderRadius: 5,
//         alignItems: 'center',
//         justifyContent: 'center',
//         margin: 3,
//         height: height / 22,
//         width: width / 10,
//     },
//     counterContainer: {
//         flex: 1,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: height / 45,
//     },
//     centeredView: {
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginTop: 5,

//         // flex: 1,
//         marginBottom: 5,
//         backgroundColor: 'red',
//         width: '100%',
//         height: '25%'
//     },
//     centeredViewComingSoon: {
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginTop: 5,

//         // flex: 1,
//         marginBottom: 5,
//         backgroundColor: '#E8F0FE',
//         width: '100%',
//         height: '25%'
//     },
//     counterText: {
//         fontSize: width / 15,
//         marginHorizontal: 10,
//         fontFamily: 'bold',
//         color: '#FFFFFF',
//     },

//     SubmitButton_area: {
//         width: width / 2.2,
//         height: height / 15,
//         marginRight: 6,

//     },
//     SubmitButton: {
//         backgroundColor: '#026E75',
//         borderRadius: 5,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: 10,
//         paddingVertical: 15,
//     },
//     Reset_area: {
//         width: width / 2.2,
//         height: height / 15

//     },
//     ResetButton: {
//         backgroundColor: '#FC4136',
//         borderRadius: 5,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: 10,
//         paddingVertical: 15,
//     },
//     DeliverystatusArea: {},
//     DeliverystatusText: {},
//     Item_Rate_Text: {
//         fontSize: width / 20,
//         marginHorizontal: 10,
//         fontFamily: 'bold',
//         color: '#FFFFFF',
//     },
//     Item_stoct_Text: {
//         marginTop: 10,
//         fontSize: width / 30,
//         marginHorizontal: 10,
//         fontFamily: 'bold',
//         color: '#FFFFFF',
//         textAlign: 'right',
//     }

// });

// export default SmockingScreen;


import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

const SmockingScreen = () => {
    const [loading, setLoading] = useState(false);

    const fetchData = () => {
        setLoading(true);
        // Simulate a network request
        setTimeout(() => {
            setLoading(false);
            alert('Data fetched!');
        }, 3000);
    };

    return (
        <View style={styles.container}>
            <Spinner
                visible={loading}
                textContent={'Loading...'}
                textStyle={styles.spinnerTextStyle}
            />
            <Text style={styles.welcome}>Welcome to React Native!</Text>
            <Button title="Fetch Data" onPress={fetchData} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        //  flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    spinnerTextStyle: {
        color: '#FFF',
    },
});

export default SmockingScreen;


