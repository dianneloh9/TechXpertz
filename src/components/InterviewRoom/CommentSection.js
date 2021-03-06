import React, { useState, useEffect } from 'react';
import CommentItem from './CommentItem';
import moment from 'moment';
import { useAuth0 } from '../../react-auth0-spa';
import './InterviewRoom.css';

const CommentSection = props => {
  const { bookingId, role } = props;
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      commentContent: '',
      commentTime: '',
      commentAuthor: ''
    }
  ]);
  const { loading } = useAuth0();
  const currentTime = moment().format('LT');
  const currentDate = moment().format('YYYY-MM-DD');
  const socket = props.socket;

  useEffect(() => {
    try {
      if (!loading && socket) {
        socket.on('error', error => {
          console.log('error', error);
        });

        socket.on('message', msg => {
          console.log(msg);
        });

        socket.on('receive comment', data => {
          setComments(prevState => {
            return [
              {
                commentContent: data.comment,
                commentTime: currentTime,
                commentAuthor: data.author
              },
              ...prevState
            ];
          });
          console.log(newComment);
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, [loading, socket]);

  const handleNewComment = event => {
    setNewComment(event.target.value);
  };

  //submitting comment by pressing enter key
  const onKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      socket.emit('comment', {
        bookingId,
        comment: newComment,
        date: currentDate,
        timeStamp: currentTime,
        author: `${props.username} (${role})`
      });
      setComments(prevState => {
        return [
          {
            commentContent: newComment,
            commentTime: currentTime,
            commentAuthor: `You (${role})`
          },
          ...prevState
        ];
      });
      setNewComment('');
    } else {
      return;
    }
  };

  //submitting button by clicking submit button
  const handleComment = event => {
    event.preventDefault();
    socket.emit('comment', {
      bookingId,
      comment: newComment,
      date: currentDate,
      timeStamp: currentTime,
      author: `${props.username} (${role})`
    });
    setComments(prevState => {
      return [
        {
          commentContent: newComment,
          commentTime: currentTime,
          commentAuthor: `You (${role})`
        },
        ...prevState
      ];
    });
    setNewComment('');
  };

  const btnClass =
    newComment === ''
      ? 'ui primary submit labeled icon disabled button'
      : 'ui primary submit labeled icon button';

  return (
    <>
      <div className='ui comments' style={{ padding: '20px 20px 0px' }}>
        <div className='ui dividing header'>Comment Section</div>
      </div>
      <div
        className='comments'
        style={{
          minHeight: '22vh',
          maxHeight: '22vh',
          overflow: 'auto',
          padding: '0px 25px'
        }}
      >
        {comments.map(item => {
          return (
            <CommentItem
              time={item.commentTime}
              key={item.comemntContent}
              comment={item.commentContent}
              role={item.commentAuthor}
            />
          );
        })}
      </div>
      <div className='ui fluid container'>
        <form
          className='ui reply form'
          style={{ padding: '20px 18px 5px' }}
          onSubmit={handleComment}
        >
          <div className='field'>
            <textarea
              placeholder='Please type in your comment here'
              type='text'
              value={newComment}
              onChange={handleNewComment}
              onKeyPress={onKeyPress}
            />
          </div>
          <button className={btnClass} type='submit'>
            <i className='icon edit'></i> Add Comment
          </button>
        </form>
      </div>
    </>
  );
};

export default CommentSection;
