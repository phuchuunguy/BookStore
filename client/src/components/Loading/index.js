import loading from '../../assets/images/loading-2.gif'

import styles from './Loading.module.css';

export default function Loading() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* <h2>Loading...</h2> */}
                <img src={loading} alt="Loading..." />
            </div>
        </div>
    );
}
