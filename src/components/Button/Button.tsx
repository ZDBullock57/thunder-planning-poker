export type ButtonProps =React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label?: string;
}

export const Button = ({ label, ...props }) => {
  return (
    <button
      type="button"
      className={`magic-btn ${className}`}
      {...rest}
    >
      <span className="magic-btn__glow" />

      <span className="magic-btn__shine" />

      <span className="magic-btn__label">
        {label ?? children}
      </span>
    </button>
  );
}