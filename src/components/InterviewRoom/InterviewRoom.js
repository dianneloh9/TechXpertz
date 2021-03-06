import React, { useEffect, useState } from 'react';
import Header from './Header';
import SubHeader from './SubHeader';
import QuestionBox from './QuestionBox';
import CommentSection from './CommentSection';
import CodeEditor from './CodeEditor';
import VideoComponent from './VideoComponent';
import axios from 'axios';
import { useAuth0 } from '../../react-auth0-spa';
import { getOrInsertQuestion } from '../../api_callers/apis.json';
import io from 'socket.io-client';

const InterviewRoom = props => {
  //check if the user booking id is < than the other person booking id
  //if it is lesser than they are assigned 'interviewee' role
  // if not they are assigned 'interviewer' role
  const [userRole, setUserRole] = useState(
    props.location.state.bookingId < props.location.state.otherBookingId
      ? 'interviewee'
      : 'interviewer'
  );
  const [disableSwitch, setDisableSwitch] = useState(true);
  const [question, setQuestion] = useState();
  const [qnSocket, setQnSocket] = useState();
  const [commentSocket, setCommentSocket] = useState();
  const [videoSocket, setVideoSocket] = useState();
  const [editorSocket, setEditorSocket] = useState();
  const [first, setFirst] = useState(true);

  const endpoints = {
    question: '/question',
    comments: '/comments',
    video: '/video',
    editor: '/editor'
  };

  //handlers
  const onChangeRoleHandler = childProp => {
    setUserRole(childProp);
    setDisableSwitch(true);
    qnSocket.emit('switch', props.location.state.bookingId);
  };

  const onExitHandler = () => {
    qnSocket.close();
    commentSocket.close();
    videoSocket.close();
    editorSocket.close();
  };

  const { getTokenSilently, loading } = useAuth0();

  const getQuestion = async token => {
    const header = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.post(
      getOrInsertQuestion,
      { bookingId: props.location.state.bookingId },
      header
    );
    return response.data.question;
  };

  useEffect(() => {
    if (!loading && first) {
      setFirst(false);
      getTokenSilently().then(token => {
        const config = {
          query: {
            bookingId: props.location.state.bookingId
          },
          transportOptions: {
            polling: {
              extraHeaders: {
                Authorization: `Bearer ${token}`
              }
            }
          }
        };

        const qnSocket = io.connect(endpoints.question, config);
        const commentSocket = io.connect(endpoints.comments, config);
        const videoSocket = io.connect(endpoints.video, config);
        const editorSocket = io.connect(endpoints.editor, config);
        setQnSocket(qnSocket);
        setCommentSocket(commentSocket);
        setVideoSocket(videoSocket);
        setEditorSocket(editorSocket);

        qnSocket.on('message', msg => {
          console.log(msg);
        });

        qnSocket.on('connect', () => {
          qnSocket.emit('role', {
            bookingId: props.location.state.bookingId,
            role: userRole
          });
        });

        qnSocket.on('receive role', data => {
          setUserRole(data.role);
          if (data.hasSwitched) {
            setDisableSwitch(true);
          }
        });

        qnSocket.on('other user connected', () => {
          qnSocket.emit(
            'receive other connection',
            props.location.state.bookingId
          );
        });

        qnSocket.on('present', () => {
          qnSocket.emit('receive present', props.location.state.bookingId);
        });

        qnSocket.on('hasSwitched', hasSwitched => {
          setDisableSwitch(hasSwitched);
        });

        qnSocket.on('receive question', qn => {
          console.log('receive question', qn);
          setQuestion(qn);
          console.log(question);
        });

        qnSocket.on('receive switch', () => {
          console.log('other user switched roles');
          setUserRole(
            userRole === 'interviewee' ? 'interviewer' : 'interviewee'
          );
          setDisableSwitch(true);
        });

        qnSocket.on('user disconnected', () => {
          setDisableSwitch(true);
        });
      });
    }
  }, [loading, userRole]);

  useEffect(() => {
    if (!loading && qnSocket) {
      getTokenSilently().then(token => {
        if (userRole === 'interviewee') {
          console.log('interviewee');
          getQuestion(token).then(function(qn) {
            setQuestion(qn);
            console.log(qn);
            qnSocket.emit('question', qn);

            qnSocket.on('receive get question', () => {
              qnSocket.emit('question', qn);
            });
          });
        }

        if (userRole === 'interviewer') {
          qnSocket.emit('get question');
        }
      });
    }
  }, [loading, userRole, qnSocket]);

  const questionBox = (
    <QuestionBox
      bookingId={props.location.state.bookingId}
      role={userRole}
      question={question}
    />
  );

  if (userRole === 'interviewee') {
    return (
      <div style={{ overflow: 'hidden' }}>
        <Header
          otherBookingId={props.location.state.otherBookingId}
          bookingId={props.location.state.bookingId}
          date={props.location.state.date}
          time={props.location.state.time}
          onExit={onExitHandler}
        />
        <SubHeader
          role='interviewee'
          otherRole='Interviewee'
          onClick={onChangeRoleHandler}
          disableSwitch={disableSwitch}
        />
        <div className='ui two column grid'>
          <div className='five wide column'>
            <div className='row'>{questionBox}</div>
            <div className='row'>
              <div className='ui container'>
                <CommentSection
                  bookingId={props.location.state.bookingId}
                  role='Interviewee'
                  socket={commentSocket}
                  username={props.location.state.username}
                />
              </div>
            </div>
          </div>
          <div className='eleven wide column'>
            <CodeEditor
              bookingId={props.location.state.bookingId}
              socket={editorSocket}
            />
            <VideoComponent
              bookingId={props.location.state.bookingId}
              otherBookingId={props.location.state.otherBookingId}
              socket={videoSocket}
            />
          </div>
        </div>
        {/* <VideoComponent
          bookingId={props.location.state.bookingId}
          otherBookingId={props.location.state.otherBookingId}
          socket={videoSocket}
        /> */}
      </div>
    );
  }

  if (userRole === 'interviewer') {
    return (
      <div style={{ overflow: 'hidden' }}>
        <Header
          otherBookingId={props.location.state.otherBookingId}
          bookingId={props.location.state.bookingId}
          date={props.location.state.date}
          time={props.location.state.time}
          onExit={onExitHandler}
        />
        <SubHeader
          role='interviewer'
          onClick={onChangeRoleHandler}
          disableSwitch={disableSwitch}
        />
        <div className='ui two column grid'>
          <div className='five wide column'>
            <div className='row'>{question && questionBox}</div>
            <div className='row'>
              <div className='ui container'>
                <CommentSection
                  bookingId={props.location.state.bookingId}
                  role='Interviewer'
                  socket={commentSocket}
                  username={props.location.state.username}
                />
              </div>
            </div>
          </div>
          <div className='eleven wide column'>
            <CodeEditor
              bookingId={props.location.state.bookingId}
              role={userRole}
              socket={editorSocket}
            />
            <VideoComponent
              bookingId={props.location.state.bookingId}
              otherBookingId={props.location.state.otherBookingId}
              socket={videoSocket}
            />
          </div>
        </div>
        {/* <VideoComponent
          bookingId={props.location.state.bookingId}
          otherBookingId={props.location.state.otherBookingId}
          socket={videoSocket}
        /> */}
      </div>
    );
  }
};

export default InterviewRoom;
