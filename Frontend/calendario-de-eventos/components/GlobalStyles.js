import { Global, css} from '@emotion/react'

const GlobalStyles = () => (
    <>
        <Global styles={css`

        :root{
        --background: rgba(253,253,253);
        --header-background: linear-gradient(180deg, rgba(38, 168, 219, 0.6) 5%, rgba(41, 224, 200, 0.6) 90%);
        --footer-background: linear-gradient(180deg, rgba(41, 224, 200, 0.6) 5%, rgba(38, 168, 219, 0.6) 90%);
        --max-width: 1800px;
        --min-height: 85vh;
        }

        

        body{
        font-family: Sans-serif;
        background-color: var(--background);
        margin: 0;
        }

        #__next{
            min-width: 360px;
            //max-width: 2000px;
            margin: 0 auto;
            text-align: center;

        }
        
        main {
            max-width: 2000px;
            margin: 0 auto;
            border-radius: 10px;
        }

        ul{
        padding: 0;
        }
        `}/>
    </>
)

export default GlobalStyles