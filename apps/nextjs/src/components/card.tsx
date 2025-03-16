import Image from 'next/image';

interface CardProps {
  imageSrc: string;
  content: string;
  title?: string;
  link?: string;
}
const Card = ({ imageSrc, content, title, link }: CardProps) => {
  return (
    <div className="flex bg-card text-card-foreground rounded-lg shadow-lg overflow-hidden border-1 my-6">
      <div className="relative w-1/3" style={{ minHeight: '200px' }}>
        {link ? <a href={link} target='_blank'><Image
          src={imageSrc}
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          className="border-r-1"
        /></a> : <Image
          src={imageSrc}
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          className="border-r-1"
        />}
      </div>
      <div className="w-2/3 p-6 flex flex-col justify-center">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-muted-foreground">{content}</p>
        {link ? <p className='mt-4 text-muted-foreground'>
          <a href={link} target="_blank" rel="noreferrer noopener" className="flex items-center gap-1">
            {link.split("://")[1]} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-external-link stroke-accent ">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </p> : ''}
      </div>
    </div>
  );
};

export default Card;