import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import useFetchGET from "./useFetchGET";
import { blogs_endpoint } from "./Universals";

const BlogDetails = () =>{
    const { id } = useParams();
    const { data, error, isPending } = useFetchGET(`${blogs_endpoint}/${id}`);
    const history = useHistory();

    const handleClick = () => {
        fetch(`${blogs_endpoint}/${data.message.id}`,{
            method: 'DELETE',
            credentials: 'include'    
        }).then(() => {
            history.push('/');
        })
    }

    return (
        <div className="blog-details">
            { isPending && <div>Loading...</div>}
            { error && <div>{ error }</div> }
            { data && data.status === 200 && (
                
                <article>
                    <h2>{ data.message.title }</h2>
                    <p class="meta-info">Created at { data.message.createdAt } <br />
                    Written by { data.message.author }
                    </p>
                    <div className="blog-body">{ data.message.body }</div>
                    <button onClick={handleClick}>Delete</button>
                </article>
            )}
            { data && data.status === 404 && (
                <div>Entry not found</div>
            )}
            <div className="comments">
            </div>
            
        </div>
    );
}


export default BlogDetails;