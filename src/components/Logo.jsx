import logoSvg from '../assets/Logo.png';

export default function Logo({ className = '' }) {
    return (
        <a
            href="https://bizzbuzzcreations.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center ${className} hover:opacity-80 transition-opacity`}
        >
            <img
                src={logoSvg}
                alt="logo Logo"
                className="w-22 h-22 object-contain"
            />
        </a>
    );
}
