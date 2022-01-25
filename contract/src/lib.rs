use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::json;
use near_sdk::{env, near_bindgen, AccountId, Promise, PanicOnDefault, ext_contract, Gas, base64};
use near_sdk::json_types::U128;
use std::collections::HashMap;

#[ext_contract(ext_croncat)]
pub trait CronContract {
    fn create_task(
        &mut self,
        contract_id: AccountId,
        function_id: String,
        cadence: String,
        recurring: Option<bool>,
        deposit: Option<U128>,
        gas: Option<u64>,
        arguments: Option<String>,
    ) -> Base64VecU8;
}
#[ext_contract(ext)]
pub trait CronContract {
    fn schedule_callback(
        &mut self,
        #[callback]
        #[serializer(borsh)]
        task_hash: Base64VecU8,
    );
}

#[derive(PartialEq, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum ProjectStatus {
    Funding,
    Funded,
    Cancelled,
    Unfulfilled,
}

#[derive(Clone, Copy, Hash, Eq, PartialEq, PartialOrd, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum SupporterType {
    Basic,
    Intermediate,
    Advanced,
}

#[derive(PartialEq, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum SupporterPlans {
    OneTime,
    Recurring,
}

#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Supporter {
    pub level: SupporterType,
    pub used_verification: bool,
}

#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Project {
    pub id: u64,
    pub owner: AccountId,
    pub name: String,
    pub description: String,
    pub supporters: HashMap<AccountId, Supporter>,
    pub balance: u128,
    pub goal: u128,
    pub end_time: u64,
    pub status: ProjectStatus,
    pub plan: SupporterPlans,
    pub level_amounts: HashMap<SupporterType, u128>,
    pub images: Vec<String>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Nearkick {
    current_id: u64,
    projects: UnorderedMap<u64, Project>,
}

#[near_bindgen]
impl Nearkick {
    #[init]
    pub fn new() -> Self {
        Self {
            current_id: 0,
            projects: UnorderedMap::new(b"p".to_vec()),
        }
    }

    pub fn add_project(&mut self, goal: u128, name: String, description: String, plan: SupporterPlans, end_time: u64, cadence: String, basic_supporter_amount: u128, intermediate_supporter_amount: u128, advanced_supporter_amount: u128, images: Vec<String>) -> u64 {
        assert!(name.len() >= 3, "Project name must be at least 3 characters");
        assert!(name.len() <= 100, "Project name must be 100 characters or less");
        assert!(description.len() >= 100, "Project description must be at least 100 characters");
        assert!(description.len() <= 500, "Project description must be 500 characters or less");
        assert!(goal >= 1, "Project goal must be at least 1");
        assert!(plan == SupporterPlans::OneTime || plan == SupporterPlans::Recurring, "Project plan must be either OneTime or Recurring");
        assert!(end_time > 0, "Project end date must be in the future");
        assert!(basic_supporter_amount >= 1, "Basic supporter amount must be at least 1");
        assert!(intermediate_supporter_amount >= 1, "Intermediate supporter amount must be at least 1");
        assert!(advanced_supporter_amount >= 1, "Advanced supporter amount must be at least 1");
        assert!(images.len() >= 1, "Project must have at least 1 image");
        assert!(images.len() <= 5, "Project images must be 5 or less");

        self.current_id += 1;
        let project = Project {
            id: self.current_id,
            owner: env::signer_account_id(),
            name,
            description,
            supporters: HashMap::new(),
            balance: 0,
            goal,
            end_time: env::block_timestamp() + end_time,
            status: ProjectStatus::Funding,
            plan,
            level_amounts: HashMap::from([
                (SupporterType::Basic, basic_supporter_amount),
                (SupporterType::Intermediate, intermediate_supporter_amount),
                (SupporterType::Advanced, advanced_supporter_amount),
            ]),
            images
        };

        self.projects.insert(&self.current_id, &project);

        ext_croncat::create_task(
            env::current_account_id(),
            "check_if_project_funded_or_unfulfilled".to_string(),
            cadence,
            Some(false),
            Some(U128::from(0)),
            Some(30_000_000_000_000), // 30 Tgas
            Some(base64::encode(json!({
                "project_id": self.current_id,
            }).to_string())),
            AccountId::new_unchecked("manager_v1.croncat.testnet".to_string()),
            3_500_000_000_000_000_000_000,
            Gas::from(25_000_000_000_000),
        );

        self.current_id
    }

    pub fn update_project(&mut self, project_id: u64, goal: u128, name: String, description: String, plan: SupporterPlans, basic_supporter_amount: u128, intermediate_supporter_amount: u128, advanced_supporter_amount: u128, images: Vec<String>) {
        assert!(name.len() >= 3, "Project name must be at least 3 characters");
        assert!(name.len() <= 100, "Project name must be 100 characters or less");
        assert!(description.len() >= 100, "Project description must be at least 100 characters");
        assert!(description.len() <= 500, "Project description must be 500 characters or less");
        assert!(goal >= 1, "Project goal must be at least 1");
        assert!(plan == SupporterPlans::OneTime || plan == SupporterPlans::Recurring, "Project plan must be either OneTime or Recurring");
        assert!(basic_supporter_amount >= 1, "Basic supporter amount must be at least 1");
        assert!(intermediate_supporter_amount >= 1, "Intermediate supporter amount must be at least 1");
        assert!(advanced_supporter_amount >= 1, "Advanced supporter amount must be at least 1");
        assert!(images.len() >= 1, "Project must have at least 1 image");
        assert!(images.len() <= 5, "Project images must be 5 or less");

        let project = self.projects.get(&project_id).unwrap();

        if project.owner != env::signer_account_id() {
            panic!("Only the owner can update the project");
        }

        let new_project = Project {
            id: project_id,
            owner: env::signer_account_id(),
            name,
            description,
            supporters: project.supporters,
            balance: project.balance,
            goal,
            end_time: project.end_time,
            status: project.status,
            plan,
            level_amounts: HashMap::from([
                (SupporterType::Basic, basic_supporter_amount),
                (SupporterType::Intermediate, intermediate_supporter_amount),
                (SupporterType::Advanced, advanced_supporter_amount),
            ]),
            images,
        };

        self.projects.insert(&project_id, &new_project);
    }

    #[payable]
    pub fn add_supporter_to_project(&mut self, project_id: u64, level: SupporterType) {
        let supporter_amount_needed = self.get_supporter_level_amount(&project_id, &level);
        let attached_deposit = env::attached_deposit();

        assert!(
            attached_deposit >= supporter_amount_needed,
            "Not enough attached deposit: Needed: {}, Attached: {}", supporter_amount_needed, attached_deposit
        );

        let mut project = self.projects.get(&project_id).unwrap();

        if project.status == ProjectStatus::Cancelled || project.status == ProjectStatus::Unfulfilled {
            env::log_str(format!("Project is cancelled or unfulfilled, cannot add supporter").as_str());
            return;
        }

        let supporter = Supporter {
            level,
            used_verification: false,
        };
        project.supporters.insert(env::signer_account_id(), supporter);
        project.balance += attached_deposit;
        if project.balance >= project.goal {
            project.status = ProjectStatus::Funded;
        }
        self.projects.insert(&project_id, &project);

        Promise::new(project.owner).transfer(attached_deposit);
    }

    pub fn verify_supporter_on_project(&mut self, project_id: u64, supporter_id: AccountId) -> bool {
        let mut project = self.projects.get(&project_id).unwrap();

        if project.status == ProjectStatus::Cancelled || project.status == ProjectStatus::Unfulfilled {
            panic!("Project is cancelled or unfulfilled, cannot verify supporter");
        }

        if project.status != ProjectStatus::Funded {
            panic!("Project is not funded, cannot verify supporter");
        }

        let supporter = project.supporters.get(&supporter_id).unwrap().clone();

        if !project.supporters.contains_key(&supporter_id) {
            panic!("{} is not a supporter of this project", supporter_id);
        }
        
        if project.plan == SupporterPlans::OneTime && supporter.used_verification {
            panic!("Supporter already used verification code");
        }

        let new_supporter = Supporter {
            level: supporter.level,
            used_verification: true,
        };
        project.supporters.insert(supporter_id, new_supporter);
        self.projects.insert(&project_id, &project);
        true
    }

    pub fn get_all_projects(&self) -> Vec<Project> {
        let mut projects = Vec::new();
        for project in self.projects.iter() {
            projects.push(project.1);
        }
        projects
    }

    pub fn get_all_projects_by_owner(&self, owner: AccountId) -> Vec<Project> {
        let mut projects = Vec::new();
        for project in self.projects.iter() {
            if project.1.owner == owner {
                projects.push(project.1);
            }
        }
        projects
    }

    pub fn get_project(&self, project_id: u64) -> Project {
        self.projects.get(&project_id).unwrap()
    }

    pub fn cancel_project(&mut self, project_id: u64) {
        let mut project = self.projects.get(&project_id).unwrap();

        if project.owner != env::signer_account_id() {
            panic!("Only the owner can cancel the project");
        }

        if project.status != ProjectStatus::Funding {
            panic!("Project must be in Funding status to be cancelled");
        }

        project.status = ProjectStatus::Cancelled;
        self.projects.insert(&project_id, &project);
        self.refund_supporters(project_id);
    }

    pub fn check_if_project_funded_or_unfulfilled(&mut self, project_id: u64) {
        let mut project = self.projects.get(&project_id).unwrap();

        if project.owner != env::signer_account_id() {
            panic!("Only the owner can check if project is funded or unfulfilled");
        }

        if project.status != ProjectStatus::Funding {
            panic!("Project must be in Funding status to be checked if funded or unfulfilled");
        }

        if project.goal > project.balance {
            project.status = ProjectStatus::Unfulfilled;
            self.refund_supporters(project_id);
            self.projects.insert(&project_id, &project);
        }
    }

    fn get_supporter_level_amount(&self, project_id: &u64, level: &SupporterType) -> u128 {
        let project = self.projects.get(project_id).unwrap();
        project.level_amounts[&level]
    }

    fn refund_supporters(&mut self, project_id: u64) {
        let mut project = self.projects.get(&project_id).unwrap();
        for supporter in project.supporters.iter() {
            let amount = self.get_supporter_level_amount(&project_id, &supporter.1.level);
            Promise::new(supporter.0.clone()).transfer(amount);

        }
        project.balance = 0;
        self.projects.insert(&project_id, &project);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{VMContextBuilder};
    use near_sdk::{testing_env, AccountId};

    fn get_context(predecessor: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(predecessor);
        builder
    }

    #[test]
    fn test_add_project() {
        let mut nearkick = Nearkick::new();
        let project_id = nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, "0 30 23 * * *".to_string(), 10000000, 10000000000, 10000000000000, Vec::new());
        assert_eq!(nearkick.projects.get(&project_id).unwrap().goal, 1000);
    }

    #[test]
    fn test_add_supporter_to_project() {
        let mut nearkick = Nearkick::new();

        let alice = AccountId::new_unchecked("alice.testnet".to_string());
        let context = get_context(alice);
        testing_env!(context.build());

        let project_id = nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, "0 30 23 * * *".to_string(),10000000, 10000000000, 10000000000000, Vec::new());
        nearkick.add_supporter_to_project(project_id, SupporterType::Basic);
        assert_eq!(nearkick.projects.get(&project_id).unwrap().balance, 0);
    }

    #[test]
    fn test_verify_supporter_on_project() {
        let mut nearkick = Nearkick::new();
        let project_id = nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, "0 30 23 * * *".to_string(),10000000, 10000000000, 10000000000000, Vec::new());
        nearkick.add_supporter_to_project(project_id, SupporterType::Basic);
        assert_eq!(nearkick.verify_supporter_on_project(project_id, AccountId::new_unchecked("supporter".to_string())), true);
    }

    #[test]
    fn test_cancel_project() {
        let mut nearkick = Nearkick::new();
        let project_id = nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, "0 30 23 * * *".to_string(),10000000, 10000000000, 10000000000000, Vec::new());
        nearkick.cancel_project(project_id);
        assert_eq!(nearkick.projects.get(&project_id).unwrap().status, ProjectStatus::Cancelled);
    }

    #[test]
    fn test_get_all_projects() {
        let mut nearkick = Nearkick::new();
        nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, "0 30 23 * * *".to_string(),10000000, 10000000000, 10000000000000, Vec::new());
        let projects = nearkick.get_all_projects();
        assert_eq!(projects.len(), 1);
    }

    #[test]
    fn test_get_project() {
        let mut nearkick = Nearkick::new();
        let project_id = nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, "0 30 23 * * *".to_string(),10000000, 10000000000, 10000000000000, Vec::new());
        let project = nearkick.get_project(project_id);
        assert_eq!(project.goal, 1000);
    }
}