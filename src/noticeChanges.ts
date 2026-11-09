import type {Opportunity} from './opportunities';
import type {SavedOfficial} from './Calendar';
import {officialDeadline} from './Calendar';

export type NoticeChange={id:string;title:string;previous:string;current:string};
// Compare only two confirmed dates of the same saved item; a missing listing is not a cancellation.
export function findDeadlineChanges(oldOpportunities:Opportunity[],currentOpportunities:Opportunity[],oldOfficial:SavedOfficial[],currentOfficial:SavedOfficial[]):NoticeChange[]{
 const changes:NoticeChange[]=[];
 const add=(id:string,title:string,previous:string|null|undefined,current:string|null|undefined)=>{
  if(!previous||!current||previous===current||!/^\d{4}-\d{2}-\d{2}$/.test(previous)||!/^\d{4}-\d{2}-\d{2}$/.test(current))return;
  changes.push({id,title,previous,current});
 };
 for(const old of oldOpportunities){const current=currentOpportunities.find(item=>item.id===old.id);if(current)add(old.id,current.title,old.deadline,current.deadline)}
 for(const old of oldOfficial){const current=currentOfficial.find(item=>item.id===old.id);if(current)add(old.id,current.title,officialDeadline(old),officialDeadline(current))}
 return changes;
}
