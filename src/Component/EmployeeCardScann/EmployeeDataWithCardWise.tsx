import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useRef, useState} from 'react';
import {Text, View, StyleSheet, Dimensions, Pressable} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {IconButton} from 'react-native-paper';
import QRCodeScanner from 'react-native-qrcode-scanner';
import instance from '../../Axiosinstance';
const {height, width} = Dimensions.get('window');
import Toast from 'react-native-toast-message';

type RootStackParamList = {
  OnlineCigaretteSale: undefined;
  LoginScreen: undefined;
  EmployeeCardNumberWiseLogin: {employeeId: string; EmployeeName: string}; // Add this line
};

type AuthLoadingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnlineCigaretteSale'
>;

const EmployeeDataWithCardWise: React.FC = () => {
  const [isOpenCamera, setIsOpenCamera] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back'); // Set initial type as 'back'
  const scanner = useRef<QRCodeScanner>(null);
  const [flashlightEnabled, setFlashlightEnabled] = useState<boolean>(false);
  const navigation = useNavigation<AuthLoadingScreenNavigationProp>();
  const handleToastMsg = (getType: string, getText: string) => {
    Toast.show({
      type: getType,
      text1: getText,
      visibilityTime: 2000,
    });
  };
  const handleOnRead = (e: any) => {
    if (e.data) {
      setScannedData(e.data);
      setIsOpenCamera(false);
      instance
        .get('/TransactionOX/GetMemberShipInformation/' + e.data)
        .then((response: any) => {
          console.log('Success:', response.data.res);

          if (response.data.res && response.data.res.membershipno) {
            navigation.navigate('EmployeeCardNumberWiseLogin', {
              employeeId: response.data.res.membershipno,
              EmployeeName: response.data.res.membername,
            });
          } else {
            handleToastMsg('error', `Employee not found in the system`);
            // Handle error: Employee not found in the system

            console.log('Error: Employee not found in the system');
          }
        })
        .catch((error: any) => {
          // Handle error
          console.log('Error:', error);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Toast />
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
            icon="camera-flip"
            size={40}
            style={styles.cameraButton}
            iconColor="#FF3B30"
            onPress={() =>
              setCameraType(cameraType === 'front' ? 'back' : 'front')
            }
          />

          <IconButton
            icon="close-circle"
            size={40}
            style={styles.toggleButton}
            iconColor="#FF3B30"
            onPress={() => setIsOpenCamera(prev => !prev)}
          />
        </>
      ) : (
        <>
          <Text style={styles.text}>Please Scan Your Employee Card</Text>

          <View
            style={{
              //  backgroundColor: 'green',
              width: width / 1.5,
              // height: height / 3,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <IconButton
              icon="barcode-scan"
              size={120}
              iconColor="#02AFAE"
              onPress={() => {
                setIsOpenCamera(!isOpenCamera);
              }}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  text: {
    color: '#02AFAE',
    fontSize: width / 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    margin: 2,
    //lineHeight: (width / 25) * 1.2,
    letterSpacing: 0.5,
    //backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  toggleButton: {
    position: 'absolute',
    top: height / 20,
    left: width / 1.4,
    zIndex: 1,
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    top: height / 20,
    left: width / 2,
    zIndex: 1,
    color: '#fff',
  },
});

export default EmployeeDataWithCardWise;
