import React from 'react';
import {useQuery} from "../utils/react-query-lite.jsx";

function getUserData() {
    return fetch('https://jsonplaceholder.typicode.com/todos')
        .then(response => response.json())
}

const A = () => {
    const {loading, data} = useQuery({ queryKey: 'A', queryFn: getUserData})
    return (
        <div>
            <h2>A</h2>
            {loading && <h3>Loading...</h3>}
            {data && JSON.stringify(data)}
        </div>
    );
};

export default A;
