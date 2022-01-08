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
    Created,
    Funded,
    Cancelled,
    Unfulfilled,
}

#[derive(Hash, Eq, PartialEq, PartialOrd, Serialize, Deserialize, BorshDeserialize, BorshSerialize, Debug)]
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

    pub fn add_project(&mut self, goal: u128, name: String, description: String, plan: SupporterPlans, end_time: u64,
        basic_supporter_amount: u128, intermediate_supporter_amount: u128, advanced_supporter_amount: u128) -> u64 {
        self.current_id += 1;
        let mut project = Project {
            id: self.current_id,
            owner: env::signer_account_id(),
            name,
            description,
            supporters: HashMap::new(),
            balance: 0,
            goal,
            end_time: env::block_timestamp() + end_time,
            status: ProjectStatus::Created,
            plan,
            level_amounts: HashMap::new(),
        };

        project.level_amounts.insert(SupporterType::Basic, basic_supporter_amount);
        project.level_amounts.insert(SupporterType::Intermediate, intermediate_supporter_amount);
        project.level_amounts.insert(SupporterType::Advanced, advanced_supporter_amount);

        self.projects.insert(&self.current_id, &project);


        ext_croncat::create_task(
            env::current_account_id(),
            "check_if_project_funded_or_unfulfilled".to_string(),
            "0 45 13 * * *".to_string(),
            Some(false),
            Some(U128::from(0)),
            Some(30_000_000_000_000), // 30 Tgas
            Some(base64::encode(json!({
                "project_id": self.current_id,
            }).to_string())),
            AccountId::new_unchecked("manager_v1.cron.testnet".to_string()),
            3_500_000_000_000_000_000_000,
            Gas::from(25_000_000_000_000),
        );

        self.current_id
    }

    pub fn update_project(&mut self, project_id: u64, goal: u128, name: String, description: String, plan: SupporterPlans,
        basic_supporter_amount: u128, intermediate_supporter_amount: u128, advanced_supporter_amount: u128) {
        let project = self.projects.get(&project_id).unwrap();
        if project.owner != env::signer_account_id() {
            panic!("Only the owner can update the project");
        }

        let mut new_project = Project {
            id: project_id,
            owner: env::signer_account_id(),
            name,
            description,
            supporters: project.supporters,
            balance: project.balance,
            goal: goal,
            end_time: project.end_time,
            status: project.status,
            plan,
            level_amounts: project.level_amounts,
        };

        new_project.level_amounts.insert(SupporterType::Basic, basic_supporter_amount);
        new_project.level_amounts.insert(SupporterType::Intermediate, intermediate_supporter_amount);
        new_project.level_amounts.insert(SupporterType::Advanced, advanced_supporter_amount);

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
        let project = self.projects.get(&project_id).unwrap();
        if project.status == ProjectStatus::Cancelled || project.status == ProjectStatus::Unfulfilled {
            env::log_str(format!("Project is cancelled or unfulfilled, cannot add supporter").as_str());
            return false;
        }
        let supporter = project.supporters.get(&supporter_id).unwrap();
        if project.plan == SupporterPlans::OneTime && supporter.used_verification {
            env::log_str(format!("Supporter already used verification code").as_str());
            return false;
        }
        // supporter.used_verification = true;
        // project.supporters.insert(supporter_id, supporter);
        self.projects.insert(&project_id, &project);
        true
    }

    pub fn get_all_projects(&self) -> Vec<Project> {
        let mut projects = Vec::new();
        for project in self.projects.iter() {
            let mut project2 = project.1;
            project2.id = project.0;
            projects.push(project2);
        }
        projects
    }

    pub fn get_project(&self, project_id: u64) -> Project {
        self.projects.get(&project_id).unwrap()
    }

    pub fn cancel_project(&mut self, project_id: u64) {
        let mut project = self.projects.get(&project_id).unwrap();
        project.status = ProjectStatus::Cancelled;
        self.projects.insert(&project_id, &project);
        self.refund_supporters(project_id);
    }

    pub fn check_if_project_funded_or_unfulfilled(&mut self, project_id: u64) {
        let mut project = self.projects.get(&project_id).unwrap();

        if project.status == ProjectStatus::Cancelled || project.status == ProjectStatus::Unfulfilled {
            return;
        }

        if project.balance >= project.goal {
            project.status = ProjectStatus::Funded;
        } else if env::block_timestamp() >= project.end_time {
            project.status = ProjectStatus::Unfulfilled;
            self.refund_supporters(project_id);
        }

        self.projects.insert(&project_id, &project);
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
        let project_id = nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, 10000000, 10000000000, 10000000000000);
        assert_eq!(nearkick.projects.get(&project_id).unwrap().goal, 1000);
    }

    #[test]
    fn test_add_supporter_to_project() {
        let mut nearkick = Nearkick::new();

        let alice = AccountId::new_unchecked("alice.testnet".to_string());
        let context = get_context(alice);
        testing_env!(context.build());

        let project_id = nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, 10000000, 10000000000, 10000000000000);
        nearkick.add_supporter_to_project(project_id, SupporterType::Basic);
        assert_eq!(nearkick.projects.get(&project_id).unwrap().balance, 0);
    }

    #[test]
    fn test_verify_supporter_on_project() {
        let mut nearkick = Nearkick::new();
        let project_id = nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, 10000000, 10000000000, 10000000000000);
        nearkick.add_supporter_to_project(project_id, SupporterType::Basic);
        assert_eq!(nearkick.verify_supporter_on_project(project_id, AccountId::new_unchecked("supporter".to_string())), true);
    }

    #[test]
    fn test_cancel_project() {
        let mut nearkick = Nearkick::new();
        let project_id = nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, 10000000, 10000000000, 10000000000000);
        nearkick.cancel_project(project_id);
        assert_eq!(nearkick.projects.get(&project_id).unwrap().status, ProjectStatus::Cancelled);
    }

    #[test]
    fn test_get_all_projects() {
        let mut nearkick = Nearkick::new();
        nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, 10000000, 10000000000, 10000000000000);
        let projects = nearkick.get_all_projects();
        assert_eq!(projects.len(), 1);
    }

    #[test]
    fn test_get_project() {
        let mut nearkick = Nearkick::new();
        let project_id = nearkick.add_project(1000, "name".to_string(), "description".to_string(), SupporterPlans::OneTime, 100, 10000000, 10000000000, 10000000000000);
        let project = nearkick.get_project(project_id);
        assert_eq!(project.goal, 1000);
    }
}