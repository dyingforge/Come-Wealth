export interface DisplayProfile {
    id: {id:string};
    name: string;
    sendAmount: number;
    claimAmount: number;
    wealthGods: WealthGod[];
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
    amount: number;
    claimAmount: number;
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
