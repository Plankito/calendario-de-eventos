import GlobalStyles from '../components/GlobalStyles'
import Header from '../components/Header'
import Footer from '../components/Footer'
import returnUserJwt from '../components/user/returnUserJwt'
import returnUserData from '../components/user/returnUserData'
import {useState, useEffect} from 'react'

const userJwt = returnUserJwt()
function MyApp({ Component, pageProps}){
  const [userData, setUserData] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
          if (userJwt !== " ") {
            await returnUserData(userJwt, setUsersData, null);
            await returnUserData(userJwt, setUserData, setLoading, "/me/");
          }
      };
      if (userJwt) {
        fetchData();
      }
    }, [userJwt]);

  return (
      <>
        {/* <ThemeProvider theme={theme}> */}
          <GlobalStyles/>
          <Header/>
          <Component {...pageProps} userJwt={userJwt} userData={userData} usersData={usersData}/>
          <Footer/>
        {/* </ThemeProvider> */}
      </>
    )
}

export default MyApp