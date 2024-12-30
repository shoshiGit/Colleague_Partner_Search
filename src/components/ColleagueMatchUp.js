import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Button, Container, Form, FormInput, Grid, GridColumn, Header, Icon, Search, Segment } from "semantic-ui-react";
import { initialState, SearchReducer } from "../Reducers/searchReducer";
import { getAddressFromServer } from "../services/api";

import MapView from "./MapView";
import "../styles/colleagueForm.css";

function ColleagueMatchUp() {
  // semantic ui עיצוב של תגיות מספריית
  const style = {
    header: {
      textAlign: "center",
      color: "#2a73e0",
      fontSize: "2.5em",
      fontWeight: "bold",
    },
    formContainer: {
      backgroundColor: "#FFFFFF",
      padding: "32px",
      borderRadius: "12px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      textAlign: "right",
    },
    button: {
      backgroundColor: "#2A73E0",
      color: "#FFFFFF",
      fontSize: "16px",
      fontWeight: "bold",
      marginTop: "1em",
    },
    checkBoxGroup: { marginBottom: "1em" },
    checkboxIcon: { marginRight: "8px" },
  };

  // ניהול פרטי המשתמש
  const [user, setUser] = useState({
    username: "",
    phone: "",
    email: "",
    searchAddress: "", // כתובת שהמשתמש מחפש
    distanceRadius: 0, //(numeric input -kilometers) רדיוס חיפוש
    internet: false,
    kitchen: false,
    coffeeMachine: false,
    rooms: 1,
    searchStatus: "Searching", // סטטוס החיפוש: מחפש, נמצא, בוטל
  });

  const [position, setPosition] = useState([32.0852991, 34.7818064]); // ברירת מחדל- תל אביב
  const [isLoading, setIsLoading] = useState(false);

  // ניהול מצב חיפוש
  const [state, dispatch] = useReducer(SearchReducer, initialState);
  const { loading, results, value, address } = state;

  // ניהול debounce כדי למנוע קריאות מרובות לשרת בזמן הקלדה
  const timeoutRef = useRef();

  const handleChange = (e, data = {}) => {
    const { name, value, checked, type } = data.name ? data : e.target;
    setUser({ ...user, [name]: type === "checkbox" ? checked : value });
  };

  // פונקציה המטפלת בשינוי הטקסט בשדה החיפוש
  const handleSearchChange = useCallback((e, data) => {
    clearTimeout(timeoutRef.current); // מניעת ביצוע קריאה ישנה
    dispatch({ type: "START_SEARCH", query: data.value }); // התחלת חיפוש

    timeoutRef.current = setTimeout(async () => {
      if (data.value.length === 0) {
        dispatch({ type: "CLEAN_QUERY" }); // איפוס חיפוש אם השדה ריק
        return;
      }
      try {
        const response = await getAddressFromServer(data.value); // APIלהחזרת תוצאות חיפןש- קריאה ל
        const formattedResults = response?.data?.map((item, index) => ({
            key: index, // מפתח ייחודי לכל תוצאה
            title: `${item.display_name} (${item.addresstype || "Unknown"})`, // כותרת התוצאה
            address: item,
          })) || [];
        dispatch({ type: "FINISH_SEARCH", results: formattedResults }); // עידכון תוצאות במצב
      } catch (error) {
        console.error("Error fetching address suggestions:", error); // טיפול בשגיאות
        dispatch({ type: "FINISH_SEARCH", results: [] }); // עדכון תוצאות ריקות במקרא של שגיעה
      }
    }, 300);
  }, []);

  // טיפול בבחירת כתובת
  const addressSelected = (e, { result }) => {
    if (result?.address) {
      setUser((prevUser) => ({ ...prevUser, searchAddress: result }));
      setPosition([result.address.lat, result.address.lon]);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setPosition([position.coords.latitude, position.coords.longitude]);
      });
    }
  }, []);

  // useEffect(() => {
  // }, [position]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(user);
    setTimeout(() => setIsLoading(false), 2000);
  };

  // איפוס ה-timeout כאשר הקומפוננטה מושמדת
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div dir="rtl" className="colleague-form">
      <Container>
        <Header style={style.header}>מצא שותף למשרד שיתופי</Header>
        <h2>הפתרון הקל למציאת שותפים לעבודת צוות</h2>
        <Grid centered>
          <GridColumn mobile={16} tablet={8} computer={7}>
            <Segment className="form-container" style={style.formContainer}>
              
              {/* טופס לחיפוש קוליג משרדי */}
              <Header>מלא את הפרטים שלך</Header>
              <Form onSubmit={handleSubmit}>
                
                {/* פרטים אישיים */}
                <FormInput label="שם משתמש" placeholder="הכנס את שם המשתמש שלך"name="username"
                  value={user.username} onChange={handleChange} icon="user"/>
                <FormInput label="דוא'ל" placeholder="הכנס את כתובת המייל שלך" name="email"
                  icon="mail" value={user.email} onChange={handleChange} id="email"/>
                <FormInput label="טלפון" placeholder="הכנס את מספר הטלפון שלך" name="phone"
                  value={user.phone} onChange={handleChange} id="phone"icon="phone" />

                <Form.Field>
                  <label htmlFor="searchAddress">כתובת לחיפוש</label>
                  <Search fluid
                    loading={loading} icon="home" placeholder="הכנס את הכתובת שלך.."
                    onSearchChange={handleSearchChange} onResultSelect={addressSelected}
                    results={results} value={value || user.searchAddress.display_name || ""}  />
                </Form.Field>

                {/* העדיפיות */}
                <Header>העדפות</Header>
                <div className="checkbox-row">
                  <Form.Group grouped>
                    <Form.Field>
                      <div className="checkbox-row">
                        <Icon name="wi-fi" size="large" className="checkbox-icon"/>
                        <Form.Checkbox name="internet" checked={user.internet} onChange={handleChange}  label="האם נדרש חיבור לאינטרנט" style={{ marginRight: "8px" }}/>
                      </div>
                    </Form.Field>
                    <Form.Field>
                      <div className="checkbox-row">
                        <Icon name="utensils" size="large"></Icon>
                        <Form.Checkbox name="kitchen" checked={user.kitchen} onChange={handleChange} label="האם נדרש מטבח" style={{ marginRight: "8px" }} />
                      </div>
                    </Form.Field>
                    <Form.Field>
                      <div className="checkbox-row">
                        <Icon name="coffee" size="large" />
                        <Form.Checkbox name="coffeeMachine" type="checkbox" checked={user.coffeeMachine} onChange={handleChange} label="האם נדרשת מכונת קפה" style={{ marginRight: "8px" }} />
                      </div>
                    </Form.Field>
                  </Form.Group>
                </div>

                {/* מרחק וחדרים */}
                <Form.Field>
                  <label>מספר חדרים</label>
                  <input type="number"  onChange={handleChange} name="rooms" value={user.rooms}
                    placeholder="הכנס את מספר החדרים הרצו" />
                </Form.Field>
                <Form.Field>
                  <label>מרחק שהוא מוכן לזוז מהכתובת שהוזנה (בק"מ)</label>
                  <input type="number"  name="distanceRadius"
                    value={user.distanceRadius} onChange={handleChange}
                    placeholder="הכנס את המרחק המקסימלי בק'מ"/>
                </Form.Field>

                {/* Hidden Search Status */}
                {/* <input type="hidden" value={searchStatus} readOnly /> */}
                
                {/* Submit Button */}
                <Button fluid className="submit-button" loading={isLoading}
                  disabled={isLoading} aria-label="Submit to search partners" style={style.button}>
                  חיפוש שותפים
                </Button>
              </Form>
            </Segment>
          </GridColumn>

          <GridColumn mobile={16} tablet={8} computer={8}>
            <Segment className="form-container" style={style.formContainer}>
              <MapView position={position} />
            </Segment>
          </GridColumn>

        </Grid>
      </Container>
    </div>
  );
}

export default ColleagueMatchUp;
