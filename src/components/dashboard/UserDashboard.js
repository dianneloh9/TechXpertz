import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import UserNavBar from './UserNavBar';
import MainDashboard from './MainDashboard';
import NormalForm from './NormalForm';
import ExpertForm from './ExpertForm';
import TypeCheckForm from './TypeCheckForm';
import LoaderPage from '../LoaderPage';
import Axios from 'axios';
import { useAuth0 } from '../../react-auth0-spa';
import { hasSubmittedBackground } from '../../api_callers/apis.json';

const UserDashboard = () => {
  const [type, setType] = useState('Loading');
  const [isOpen, setIsOpen] = useState(true);
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const [loader, setLoader] = useState(true);
  const { loading, isAuthenticated, getTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchHasSubmittedForm = async () => {
      try {
        const token = await getTokenSilently();
        const header = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await Axios.get(hasSubmittedBackground, header);
        const { hasSubmittedForm } = response.data;
        setHasSubmittedForm(hasSubmittedForm);
        if (!hasSubmittedForm) {
          setType('AccountType');
          setLoader(false);
        } else {
          setIsOpen(false);
          setLoader(false);
        }
        return response;
      } catch (err) {
        console.log(err);
      }
    };

    if (!loading) {
      fetchHasSubmittedForm();
    }
  }, [hasSubmittedForm, loading]);

  const typeCheck = type => {
    setType(type);
  };

  const submitCheck = value => {
    setIsOpen(!value);
  };

  if (loader) {
    return (
      <div>
        <UserNavBar selected={{ about: false, FAQ: false, profile: false }} />
        <LoaderPage />
      </div>
    );
  } else if (!isOpen & !loader) {
    return (
      <div>
        <UserNavBar selected={{ about: false, FAQ: false, profile: false }} />
        <MainDashboard />
      </div>
    );
  }
  return (
    <div>
      <UserNavBar selected={{ about: false, FAQ: false, profile: false }} />
      <TypeCheckForm
        type={type}
        onTypeClick={typeCheck}
        hasSubmittedForm={hasSubmittedForm}
      />
      <NormalForm
        type={type}
        hasSubmittedForm={hasSubmittedForm}
        onSubmitClick={submitCheck}
        onTypeClick={typeCheck}
      />
      <ExpertForm
        type={type}
        hasSubmittedForm={hasSubmittedForm}
        onSubmitClick={submitCheck}
        onTypeClick={typeCheck}
      />
    </div>
  );
};

export default UserDashboard;
