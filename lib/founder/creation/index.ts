import type { FounderCreationOpportunity } from "../types";
import { sampleCreationRepository } from "../repositories";

export function getWorkshopIdeas(): FounderCreationOpportunity[] {
  return sampleCreationRepository.listWorkshops();
}

export function getCourseIdeas(): FounderCreationOpportunity[] {
  return sampleCreationRepository.listCourses();
}

export function getNewsletterIdeas(): FounderCreationOpportunity[] {
  return sampleCreationRepository.listNewsletters();
}

export function getLeadMagnetIdeas(): FounderCreationOpportunity[] {
  return sampleCreationRepository.listLeadMagnets();
}

export function getSocialCampaignIdeas(): FounderCreationOpportunity[] {
  return sampleCreationRepository.listSocialCampaigns();
}

export function getVideoIdeas(): FounderCreationOpportunity[] {
  return sampleCreationRepository.listVideos();
}

export function getAllCreationIdeas(): FounderCreationOpportunity[] {
  return sampleCreationRepository.listAll();
}
