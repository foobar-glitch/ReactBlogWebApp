import React from 'react';
import { Link } from "react-router-dom";

const BlogList = ({blogs, title}) => {
    return(
        <div className="blog-list">
            <h1>{ title }</h1>
            {blogs.map((blog) => (
                <div className="blog-preview" key={blog.blogId}>
                    <Link to={`/blogs/${blog.blogId}`}>
                        <h2>{ blog.title }</h2>
                        <p>Written by <b>{blog.author}</b></p>
                    </Link>
                </div>
            ))}
        </div>
    );
}

export default BlogList;