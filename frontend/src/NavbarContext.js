import { createContext, useState, useContext } from 'react';
import { getCookie } from './components/Cookies';

const NavbarContext = createContext();

export const useNavbar = () => useContext(NavbarContext);

export const NavbarProvider = ({ children }) => {
  const [numberOfNewFeedbacksReq, setNumberOfNewFeedbacksReq] = useState(0);
  const [numberOfNewFeedbacks, setNumberOfNewFeedbacks] = useState(0);
  const [numberOfTrainingRequests, setNumberOfTrainingRequests] = useState(0);
  const [numberOfTraineeRequests, setNumberOfTraineeRequests] = useState(0);
  const [numberOfTrainingsStatus, setNumberOfTrainingsStatus] = useState(0);
  const [numberOfRequestsReponses, setNumberOfRequestsReponses] = useState(0);
  const [numberOfDeletedTrainee, setNumberOfDeletedTrainee] = useState(0);
  const [numberOfQuizFromTrainer, setNumberOfQuizFromTrainer]= useState(0);
  const [numberOfQuizFromTrainee, setNumberOfQuizFromTrainee]= useState(0);
  const [selectedRole, setSelectedRole] = useState(getCookie("Role") || "");

  return (
    <NavbarContext.Provider value={{ 
        numberOfNewFeedbacksReq, setNumberOfNewFeedbacksReq,
        numberOfNewFeedbacks, setNumberOfNewFeedbacks,
        numberOfTrainingRequests, setNumberOfTrainingRequests,
        numberOfTraineeRequests, setNumberOfTraineeRequests,
        numberOfTrainingsStatus, setNumberOfTrainingsStatus,
        numberOfRequestsReponses, setNumberOfRequestsReponses,
        numberOfDeletedTrainee, setNumberOfDeletedTrainee,
        numberOfQuizFromTrainer, setNumberOfQuizFromTrainer,
        numberOfQuizFromTrainee, setNumberOfQuizFromTrainee,
        selectedRole,setSelectedRole
        }}>
      {children}
    </NavbarContext.Provider>
  );
};