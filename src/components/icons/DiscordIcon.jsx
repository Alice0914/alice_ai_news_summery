import React from 'react';
import discordIconImg from '../../assets/discord_icon.png';

const DiscordIcon = ({ className }) => (
  <img
    src={discordIconImg}
    alt="Discord"
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

export default DiscordIcon;
