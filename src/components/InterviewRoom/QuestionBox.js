import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '../../react-auth0-spa';
import LoaderPage from '../LoaderPage';
import { getOrInsertQuestion } from '../../api_callers/apis.json';

const QuestionBox = props => {
  const [question, setQuestion] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [questionTabState, setQuestionTabState] = useState({
    header: 'active item',
    tabContent: 'ui bottom attached active tab segment'
  });
  const [hintTabState, setHintTabState] = useState({
    header: 'item',
    tabContent: 'ui bottom attached tab segment'
  });
  const [answerTabState, setAnswerTabState] = useState({
    header: 'item',
    tabContent: 'ui bottom attached tab segment'
  });
  const { getTokenSilently, loading } = useAuth0();

  useEffect(() => {
    const getQuestion = async () => {
      const token = await getTokenSilently();
      const header = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.post(
        getOrInsertQuestion,
        { bookingId: props.bookingId },
        header
      );
      return response.data.question;
    };

    if (!loading) {
      getQuestion().then(function(qn) {
        setQuestion(qn);
        setIsLoading(false);
        console.log(qn);
      });
    }
  }, [loading]);

  const tabHandler = value => {
    console.log('value', value);
    switch (value) {
      case 'QUESTION':
        setQuestionTabState({
          header: 'active item',
          tabContent: 'ui bottom attached active tab segment'
        });
        setAnswerTabState({
          header: 'item',
          tabContent: 'ui bottom attached tab segment'
        });
        setHintTabState({
          header: 'item',
          tabContent: 'ui bottom attached tab segment'
        });
        break;

      case 'HINT':
        setQuestionTabState({
          header: 'item',
          tabContent: 'ui bottom attached tab segment'
        });
        setAnswerTabState({
          header: 'item',
          tabContent: 'ui bottom attached tab segment'
        });
        setHintTabState({
          header: 'active item',
          tabContent: 'ui bottom attached active tab segment'
        });
        break;

      case 'ANSWER':
        setQuestionTabState({
          header: 'item',
          tabContent: 'ui bottom attached tab segment'
        });
        setAnswerTabState({
          header: 'active item',
          tabContent: 'ui bottom attached active tab segment'
        });
        setHintTabState({
          header: 'item',
          tabContent: 'ui bottom attached tab segment'
        });
        break;

      default:
        console.log('Wont come here!');
    }
  };

  if (props.role === 'interviewer') {
    return (
      <>
        <div
          className='ui top attached tabular menu'
          style={{ backgroundColor: '#eeeded' }}
        >
          <a
            onClick={() => tabHandler('QUESTION')}
            className={questionTabState.header}
          >
            <h3>Question</h3>
          </a>
          <a onClick={() => tabHandler('HINT')} className={hintTabState.header}>
            <h3>Hint</h3>
          </a>
          <a
            onClick={() => tabHandler('ANSWER')}
            className={answerTabState.header}
          >
            <h3>Answer</h3>
          </a>
        </div>
        <div
          className={questionTabState.tabContent}
          style={{ height: '35vh', overflow: 'auto' }}
        >
          <span>{question && question.content}</span>
        </div>
        <div className={hintTabState.tabContent}>
          <span>Hint</span>
        </div>
        <div className={answerTabState.tabContent}>
          <span>Answer</span>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div
          className='ui top attached tabular menu'
          style={{ backgroundColor: '#eeeded' }}
        >
          <div className='active item'>
            <h3>Question</h3>
          </div>
        </div>
        <div
          className='ui bottom attached active tab segment'
          style={{ height: '35vh', overflow: 'scroll' }}
        >
          <span>{question && question.content}</span>
        </div>
      </>
    );
  }
};

export default QuestionBox;
