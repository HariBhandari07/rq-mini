import './App.css'
import {QueryClient, QueryClientProvider} from "./utils/react-query-lite.jsx";
import A from "./components/A.jsx";

const queryClient = new QueryClient()
console.log(queryClient, 111111)

function App() {
    return (
        <div>
            <QueryClientProvider client={queryClient}>
                <h2>Winning</h2>
                <A />
            </QueryClientProvider>
        </div>
    )
}

export default App
