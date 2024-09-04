import React from 'react';
import { csrf_endpoint } from './Universals';
import useFetchGET from './useFetchGET';

const CsrfInput = () => {
const { data: csrf, isPending: csrf_is_pending, error: error_csrf } = useFetchGET(csrf_endpoint)

  return (
    (!csrf_is_pending && !error_csrf && csrf&& csrf.status === 200) &&
    (<input type='hidden' name="_csrf" value={csrf.message} required></input>)
    
  );
};

export default CsrfInput;