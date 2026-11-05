import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <svg className={styles.logo} viewBox="0 0 214 96" role="img" aria-label="ERET Café" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor" fontFamily="Arial, sans-serif">
        <text x="0 57 118 176" y="54" fontSize="54" fontWeight="700">ERET</text>
        <text x="118" y="94" fontSize="26" fontWeight="400">Café</text>
      </g>
    </svg>
  );
}
