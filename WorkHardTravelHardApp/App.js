import { theme } from "./colors";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Fontisto, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@toDos";
const TAB_KEY = "@menu";

export default function App() {
  const [tab, setTab] = useState("work");
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editList, setEditList] = useState([]);

  useEffect(() => {
    (async () => {
      setTab((await AsyncStorage.getItem(TAB_KEY)) ?? "work");
    })();
  }, []);

  useEffect(() => {
    (async () => {
      AsyncStorage.setItem(TAB_KEY, tab);
    })();
  }, [tab]);

  const travel = () => setTab("travel");
  const work = () => setTab("work");
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(s));
  };

  useEffect(() => {
    loadToDos();
  }, []);

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newTodos = { ...toDos, [Date.now()]: { text, tab, isDone: false } };
    setToDos(newTodos);
    await saveToDos(newTodos);
    setText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: tab === "work" ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: tab === "travel" ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          tab === "work" ? "Add a To Do" : "Where do you want to go?"
        }
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].tab === tab ? (
            <ToDo
              key={key}
              keyValue={key}
              toDos={toDos}
              setToDos={setToDos}
              saveToDos={saveToDos}
            />
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const ToDo = ({ keyValue: key, toDos, setToDos, saveToDos }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [newText, setNewText] = useState("");

  const doneToDo = async () => {
    const newToDos = { ...toDos };
    newToDos[key].isDone = true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const deleteToDo = async () => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  const startEdit = () => {
    setIsEdit(true);
    setNewText(toDos[key].text);
  };

  const onChangeText = (payload) => setNewText(payload);

  const onEndEditing = (e) => {
    const newText = e.nativeEvent.text;
    setIsEdit(false);
    setNewText("");
    const newToDos = { ...toDos };
    newToDos[key].text = newText;
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  return (
    <View style={styles.toDo} key={key}>
      {isEdit ? (
        <TextInput
          style={styles.toDoText}
          placeholder="Enter New To Do"
          value={newText}
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
          returnKeyType="done"
          autoFocus
        />
      ) : (
        <Text
          style={{
            ...styles.toDoText,
            textDecorationLine: toDos[key].isDone ? "line-through" : "none",
          }}
        >
          {toDos[key].text}
        </Text>
      )}
      <View style={styles.toDoBtn}>
        {!toDos[key].isDone && (
          <TouchableOpacity onPress={() => doneToDo(key)}>
            <Feather name="check-square" size={20} color={theme.toDoBtn} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={startEdit}>
          <Feather name="edit-3" size={18} color={theme.toDoBtn} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteToDo(key)}>
          <Fontisto name="trash" size={18} color={theme.toDoBtn} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: { color: "white", fontSize: 16, fontWeight: "500" },
  toDoBtn: { flexDirection: "row", alignItems: "center", gap: 10 },
});
