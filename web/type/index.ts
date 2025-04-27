import { CoinMetadata } from '@mysten/sui/client';
  
  
  export interface DisplayProfile {
      id: {id:string};
      name: string;
      sendAmount: number;
      claimAmount: number;
      wealthGods: WealthGod[];
  }

  export interface WealthGodData{
    name: string;
    value: number;
  }
  
  export interface SuiCoin  {
    id: string,
    type: string,
    coinMetadata?: CoinMetadata,
    balance?: number,
  }

  export interface LeaderboardItem {
    id: string;
    name: string;
    amount: number;
  }
  
  export interface Profile {
    id: {id:string};
    name: string;
    sendAmount: number;
    claimAmount: number;
    wealthGods: string[];
  }

  export interface WealthGod {
      id: {id:string};
      sender: string;
      description: string;
      isclaimed: boolean;
      claimAmount: number;
      send_amount: number;
      coin_type: {fields:{name:string}};
      coin?: WealthGodData;
  }

  export interface State {
      id: string;
      profiles: ProfileCreated[];
  }

  export interface WealthGodCreated {
      id: string;
      sender: string;
  }

  export interface ProfileCreated {
      id: string;
      owner: string;
  }
