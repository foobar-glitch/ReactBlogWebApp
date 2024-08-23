import React from 'react';
import BlogList from "./BlogList";
import { blogs_endpoint } from "./Universals";
import useGETFetch from "./useFetchGET";


const Home = () => {
    
    const { data: blogs, isPending, error } = useGETFetch(blogs_endpoint);
    return (
        <div className="home">
            { !blogs && error && <div><b>Error:</b> {error}</div>}
            { isPending && <div>Loading...</div> }
            { blogs && <BlogList blogs={blogs} title="All Blogs"/> }
        </div>

    );
}

export default Home;