import { clx } from '@medusajs/ui';

type ThumbnailProps = {
  src?: string | null;
  alt?: string;
  size?: 'small' | 'base' | 'large';
};

const sizeMap = {
  small: { width: 16, height: 20 },
  base: { width: 24, height: 32 },
  large: { width: 36, height: 48 }
};

export const Thumbnail = ({ src, alt, size = 'base' }: ThumbnailProps) => {
  if (src) {
    return (
      <div
        className={clx(
          'flex items-center justify-center overflow-hidden rounded border border-ui-border-base bg-ui-bg-component',
          {
            'h-8 w-6': size === 'base',
            'h-5 w-4': size === 'small',
            'h-12 w-9': size === 'large'
          }
        )}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  const { width, height } = sizeMap[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 15 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 20H12C13.6569 20 15 18.6569 15 17V5.24264C15 4.44699 14.6839 3.68393 14.1213 3.12132L11.8787 0.87868C11.3161 0.316071 10.553 0 9.75736 0H3C1.34315 0 0 1.34315 0 3V17C0 18.6569 1.34315 20 3 20Z"
        fill="#E4E4E7"
      />
      <path
        d="M3 0.25H9.75781C10.487 0.25012 11.1865 0.540046 11.7021 1.05566L13.9443 3.29785C14.46 3.81347 14.7499 4.51301 14.75 5.24219V17C14.75 18.5188 13.5188 19.75 12 19.75H3C1.48122 19.75 0.25 18.5188 0.25 17V3C0.25 1.57618 1.3321 0.405533 2.71875 0.264648L3 0.25Z"
        stroke="#18181B"
        strokeOpacity="0.1"
        strokeWidth="0.5"
      />
      <path
        opacity="0.4"
        d="M4.875 6.875H10.125C10.8145 6.875 11.375 7.43554 11.375 8.125V11.875C11.375 12.5645 10.8145 13.125 10.125 13.125H4.875C4.18554 13.125 3.625 12.5645 3.625 11.875V8.125C3.625 7.43554 4.18554 6.875 4.875 6.875ZM4.875 7.375C4.46146 7.375 4.125 7.71146 4.125 8.125V11.875C4.125 12.2768 4.44257 12.6055 4.83984 12.624L4.89453 12.627L7.74121 9.78027C8.22895 9.29329 9.02172 9.2932 9.50879 9.78027L10.6621 10.9326L10.875 11.1465V8.125C10.875 7.71146 10.5385 7.375 10.125 7.375H4.875ZM5.875 8.625C6.15114 8.62501 6.375 8.84886 6.375 9.125C6.37499 9.40113 6.15113 9.62499 5.875 9.625C5.59886 9.625 5.37501 9.40114 5.375 9.125C5.375 8.84886 5.59886 8.625 5.875 8.625Z"
        fill="#52525B"
        stroke="#18181B"
        strokeWidth="0.25"
      />
    </svg>
  );
};
