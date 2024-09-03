import React, {useState} from 'react';
import {View, Text, FlatList, Button, StyleSheet, Alert} from 'react-native';
import {Checkbox} from 'react-native-paper';

type Item = {
  id: number;
  itemCode: string;
  itemName: string;
  itemDesc: string;
  quantity: number;
  salesRate: number;
  localRate: number;
  image: string;
  driveAddress: string;
  selected: boolean;
  count: number;
};

const SelectAll = () => {
  const [items, setItems] = useState<Item[]>([
    {
      id: 173,
      itemCode: '0800120020',
      itemName: 'Benson & Hedges (Red)',
      itemDesc: 'Cigarette (0800120020) - Benson & Hedges (Red)',
      quantity: 100.0,
      salesRate: 18.0,
      localRate: 20.0,
      image: '0800120020.JPG',
      driveAddress: '1',
      selected: false,
      count: 0,
    },
    {
      id: 175,
      itemCode: '0800120022',
      itemName: 'Benson & Hedges (White)',
      itemDesc: 'Cigarette (0800120022) - Benson & Hedges (White)',
      quantity: 100.0,
      salesRate: 20.0,
      localRate: 20.0,
      image: '0800120022.JPG',
      driveAddress: '2',
      selected: false,
      count: 0,
    },
    {
      id: 174,
      itemCode: '0800120021',
      itemName: 'Gold Leaf',
      itemDesc: 'Cigarette (0800120021) - Gold Leaf',
      quantity: 100.0,
      salesRate: 15.0,
      localRate: 15.0,
      image: '0800120021.JPG',
      driveAddress: '3',
      selected: false,
      count: 0,
    },
  ]);

  const incrementQuantity = (id: number) => {
    console.log('incrementQuantity Id: ' + id);

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.count <= 3
          ? {...item, count: item.count + 1}
          : item,
      ),
    );
  };

  const decrementQuantity = (id: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.count > 0
          ? {...item, count: item.count - 1}
          : item,
      ),
    );
  };

  const toggleSelectItem = (id: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? {...item, selected: !item.selected} : item,
      ),
    );
  };

  const allSelectItems = () => {
    const allSelected = items.every(item => item.selected);
    setItems(prevItems =>
      prevItems.map(item => ({...item, selected: !allSelected})),
    );
  };

  const getSelectedItems = () => {
    const selectedItems = items.filter(item => item.selected);
    // Perform any action with the selected items or display them
    //console.log('Selected Items:', selectedItems);
    Alert.alert('Selected Items', JSON.stringify(selectedItems, null, 2));
  };

  const renderItem = ({item}: {item: Item}) => (
    <View style={styles.itemContainer}>
      <Checkbox
        status={item.selected ? 'checked' : 'unchecked'}
        onPress={() => toggleSelectItem(item.id)}
      />
      <Text>{item.itemName}</Text>
      <Text>Quantity: {item.quantity}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="+"
          onPress={() => incrementQuantity(item.id)}
          disabled={item.count >= 3}
        />
        <Text> count : {item.count}</Text>
        <Button
          title="-"
          onPress={() => decrementQuantity(item.id)}
          disabled={item.count === 0}
        />
      </View>
    </View>
  );

  const isAllSelected = items.every(item => item.selected);

  return (
    <View style={styles.container}>
      <Checkbox
        status={isAllSelected ? 'checked' : 'unchecked'}
        onPress={allSelectItems}
      />
      <Text>{isAllSelected ? 'Deselect All' : 'Select All'}</Text>
      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
      <Button title="Get Selected Items" onPress={getSelectedItems} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
});

export default SelectAll;
