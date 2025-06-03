import dayjs from 'dayjs';
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {callCurationTypesAPI} from "../../apis/CurationAPICalls.js";
import search from '../../assets/search.png';
import VideoList from '../../components/video/VideoList.jsx';
import EmotionModal from '../mylibrary/calendar/EmotionModal.jsx';
import UserMainCSS from './UserMain.module.css';


function UserMain() {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTypesLoaded, setIsTypesLoaded] = useState(false);
    const today = dayjs();  // import dayjs
    // const token = sessionStorage.getItem("accessToken");   //5.30 변경 테스트중
    const token = sessionStorage.getItem("accessToken");   //5.30 변경 테스트중
    const userId = sessionStorage.getItem("userId");   //5.30 변경 테스트중
    const types = useSelector(state => state.curation.type);
    const convertEmojiToEnum = (emoji) => {
        switch (emoji) {
            case '🙂':
                return 'NORMAL';
            case '😁':
                return 'HAPPY';
            case '😭':
                return 'SAD';
            case '😡':
                return 'ANGRY';
            case '😵‍💫':
                return 'ANXIOUS';
            default:
                return 'NORMAL';
        }
    };

    useEffect(() => {
        const userId = sessionStorage.getItem("userId");   //5.30 변경 테스트중
        const token = sessionStorage.getItem("accessToken");   //5.30 변경 테스트중
        // const userId = localStorage.getItem("userId");
        // const token = localStorage.getItem("accessToken");

        if (!token || !userId || token === 'undefined' || userId === 'undefined') return;

        const todayStr = dayjs().format('YYYY-MM-DD');
        const modalKey = `emotionModalShown_${userId}_${todayStr}`;
        // userId + 날짜 기준으로 체크
        if (!localStorage.getItem(modalKey)) {
            setIsModalOpen(true);
            localStorage.setItem(modalKey, 'true');
        }
    }, [sessionStorage.getItem("userId")]);   //5.30 변경 테스트중
    // }, [localStorage.getItem("userId")]);

    useEffect(() => {
        const fetchTypes = async () => {
            if (!token || !userId || token === 'undefined' || userId === 'undefined') {
                await dispatch(callCurationTypesAPI({login: false}));
            } else {
                await dispatch(callCurationTypesAPI({login: true}));
            }
            setIsTypesLoaded(true);
        };
        fetchTypes();
    }, []);

    return (<>
            <div className={UserMainCSS.main}>
                <div className={UserMainCSS.mainImgBox}>
                    <div className={UserMainCSS.mainSearch}>
                        <div className={UserMainCSS.buttonBox}>
                            <input className={UserMainCSS.mainSearchInput} type="text" name="search"
                                   placeholder="검색어를 입력하세요"/>
                            <button className={UserMainCSS.buttonNone}><img src={search}/></button>
                        </div>
                        <div className={UserMainCSS.buttonBox}>
                            <button className={UserMainCSS.mainKeywordButton}>#키워드</button>
                            <button className={UserMainCSS.mainKeywordButton}>#키워드</button>
                            <button className={UserMainCSS.mainKeywordButton}>#키워드</button>
                        </div>
                    </div>
                </div>
                <p className={UserMainCSS.readio}>READIO</p>
                <div className={UserMainCSS.backgroundTexture}>
                    <div className={UserMainCSS.mainTextBox}>
                        <p className={UserMainCSS.mainText}>" readio는 책과 영상을 통해 마음을 연결하는 공간입니다.
                            계절처럼 변하는 하루하루,
                            당신에게 꼭 맞는 이야기를 전합니다. "</p>
                    </div>
                    <div className={UserMainCSS.videoSection}>
                        {isTypesLoaded && types?.length > 0 && types.map(type =>
                            <VideoList type={type} userId={userId} key={type.typeId}/>
                        )}
                    </div>
                </div>
            </div>
            {isModalOpen && (<EmotionModal
                    onSelect={(emoji) => {
                        const userId = sessionStorage.getItem("userId");   //5.30 변경 테스트중
                        // const userId = localStorage.getItem("userId");
                        if (!userId || !token) {
                            alert("로그인이 필요합니다.");
                            return;
                        }

                        const requestData = {
                            userId: userId, emotionType: convertEmojiToEnum(emoji), date: today.format('YYYY-MM-DD')
                        };

                        fetch('/api/user/emotions', {
                            method: 'POST', headers: {
                                'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`

                            }, body: JSON.stringify(requestData)
                        })
                            .then(res => {
                                if (res.ok) {
                                    console.log("감정 등록 성공");
                                    setIsModalOpen(false);
                                } else {
                                    alert('감정 등록 실패');
                                }
                            })
                            .catch(err => {
                                console.error('감정 등록 오류:', err);
                            });
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />)}
        </>)
}

export default UserMain;