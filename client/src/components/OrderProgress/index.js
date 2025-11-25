import { FaCheck } from "react-icons/fa";

import steps from "./enum.js"
import styles from './OrderProgress.module.css'

export default function OrderProgress({ current }) {
    return (
        <div className="d-flex justify-content-between">
            {steps.map((step, index) => {
                return (
                    <div 
                        key={step?.code} 
                        className={`${styles.stepItem } ${index <= current && styles.complete}`}  style={{width: `${100 / steps.length}%`}}
                    >
                        <div className={styles.step}>
                        {index <= current ? <FaCheck /> : (index +1)}
                        </div>
                        <p>{step?.text}</p>
                    </div>
                )
            })}
        </div>
    )
}